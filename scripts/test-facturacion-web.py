"""Prueba del módulo local (servidor en puerto 3000). Crea y elimina su propio comprobante.
Requiere Python con playwright y pypdf, Chromium instalado y Node con las dependencias del proyecto.
"""
import io
import json
import os
from pathlib import Path
import subprocess
from playwright.sync_api import sync_playwright, expect
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('FACTURACION_TEST_URL', 'http://localhost:3000')
os.chdir(ROOT)
out = ROOT / 'tmp' / 'pdfs'
out.mkdir(parents=True, exist_ok=True)
setup = """
const dotenv=require('dotenv'); dotenv.config({path:'.env.local',quiet:true}); dotenv.config({path:'.env',quiet:true});
const {PrismaClient}=require('@prisma/client'); const jwt=require('jsonwebtoken'); const p=new PrismaClient();
(async()=>{try{const a=await p.admin.findFirst({where:{role:'admin'}}); if(!a)throw Error('No administrator');
console.log(JSON.stringify({token:jwt.sign({adminId:a.id,email:a.email,role:a.role},process.env.JWT_SECRET||'secret-key-change-in-production',{expiresIn:'15m'})}));
}finally{await p.$disconnect()}})().catch(()=>process.exit(1));
"""
token = json.loads(subprocess.check_output(['node', '-e', setup], text=True))['token']
headers = {'Authorization': f'Bearer {token}'}
record_id = None
extra_ids = []
with sync_playwright() as p:
    launch = {'headless': True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):
        launch['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
    browser = p.chromium.launch(**launch)
    context = browser.new_context(viewport={'width': 1536, 'height': 1100}, accept_downloads=True)
    request = context.request
    before = request.get(f'{BASE}/api/facturacion', headers=headers).json()
    try:
        for method, endpoint in [('GET', ''), ('POST', ''), ('POST', '/preview'), ('PUT', '/missing'), ('DELETE', '/missing'), ('GET', '/missing/pdf')]:
            response = request.fetch(f'{BASE}/api/facturacion{endpoint}', method=method, data='{}')
            assert response.status == 401, (endpoint, response.status)
        assert request.get(f'{BASE}/api/facturacion/missing/pdf', headers=headers).status == 404
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.add_init_script(f"localStorage.setItem('accessToken', {json.dumps(token)});")
        page.goto(f'{BASE}/dashboard/admin/facturacion')
        page.wait_for_load_state('networkidle')
        expect(page.get_by_role('heading', name='Facturación electrónica', exact=True)).to_be_visible()
        expect(page.get_by_label('Serie', exact=True)).to_have_value('F001')
        page.get_by_label('Tipo de comprobante', exact=True).select_option('Boleta')
        expect(page.get_by_label('Serie', exact=True)).to_have_value('B001')
        page.get_by_label('Tipo de comprobante', exact=True).select_option('Factura')
        expect(page.get_by_role('button', name='Guardar comprobante', exact=True)).to_be_visible()
        page.get_by_label('RUC', exact=True).fill('20000000001')
        page.get_by_label('Nombre o razón social del cliente *', exact=True).fill('Cliente QA de facturación')
        page.get_by_label('Número de documento *', exact=True).fill('20000000002')
        page.get_by_label('Descripción 1 *', exact=True).fill('Fabricación e instalación de muebles de cocina')
        page.get_by_label('Precio unitario 1', exact=True).fill('2500')
        page.get_by_label('Descuento 1', exact=True).fill('100')
        page.get_by_role('button', name='Agregar concepto', exact=True).click()
        page.get_by_label('Descripción 2 *', exact=True).fill('Tablero de melamina acabado roble natural')
        page.get_by_label('Cantidad 2', exact=True).fill('2')
        page.get_by_label('Precio unitario 2', exact=True).fill('180')
        visible_text = page.locator('body').inner_text().lower()
        assert all(term not in visible_text for term in ['sin validez', 'de prueba', 'demostración', 'muestra', 'ejemplo', 'sunat', 'demo-'])
        page.get_by_role('button', name='Vista previa PDF').click()
        expect(page.get_by_title('Vista previa del comprobante PDF')).to_be_visible(timeout=30000)
        expect(page.get_by_title('Vista previa del comprobante PDF')).to_have_attribute('data-rendered', 'true', timeout=30000)
        page.get_by_label('Zoom del PDF').select_option('1.5')
        expect(page.get_by_title('Vista previa del comprobante PDF')).to_have_attribute('data-rendered', 'true', timeout=30000)
        page.get_by_label('Zoom del PDF').select_option('1')
        # Regresión: el render no debe reiniciarse al aparecer/desaparecer
        # la barra de scroll ni al cambiar zoom/ancho rápidamente.
        canvas = page.get_by_title('Vista previa del comprobante PDF')
        for width in [1500, 1540, 1560, 1600]:
            page.set_viewport_size({'width': width, 'height': 1100})
            page.get_by_label('Zoom del PDF').select_option('2')
            page.get_by_label('Zoom del PDF').select_option('1.25')
            page.get_by_label('Zoom del PDF').select_option('1')
            expect(canvas).to_have_attribute('data-rendered', 'true', timeout=30000)
        stability = canvas.evaluate("""async canvas => {
          const events=[];
          const observer=new MutationObserver(records=>events.push(...records.map(r=>r.attributeName)));
          observer.observe(canvas,{attributes:true,attributeFilter:['width','height','style','data-rendered']});
          await new Promise(resolve=>setTimeout(resolve,2000));
          observer.disconnect();
          return {events,ready:canvas.dataset.rendered,width:canvas.width,height:canvas.height};
        }""")
        assert not stability['events'] and stability['ready'] == 'true', stability
        assert stability['width'] > 0 and stability['height'] > 0
        for _ in range(3):
            with page.expect_response(lambda r: r.url.endswith('/api/facturacion/preview') and r.request.method == 'POST'):
                page.get_by_role('button', name='Vista previa PDF', exact=True).click()
            expect(canvas).to_have_attribute('data-rendered', 'true', timeout=30000)
            expect(page.get_by_role('alert').filter(has_text='No se pudo')).to_have_count(0)
        with page.expect_response(lambda r: r.url == f'{BASE}/api/facturacion' and r.request.method == 'POST') as saved:
            page.get_by_role('button', name='Guardar comprobante', exact=True).click()
        result = saved.value.json()
        assert saved.value.status == 201, result
        record_id = result['id']
        expect(page.get_by_role('status').filter(has_text='guardado')).to_be_visible(timeout=30000)
        expect(page.get_by_role('link', name='Descargar', exact=True)).to_be_visible(timeout=30000)
        page.wait_for_load_state('networkidle')
        expect(page.get_by_title('Vista previa del comprobante PDF')).to_have_attribute('data-rendered', 'true', timeout=30000)
        pdf_response = request.get(f'{BASE}/api/facturacion/{record_id}/pdf', headers=headers)
        assert pdf_response.status == 200
        assert pdf_response.headers['content-type'].startswith('application/pdf')
        assert 'inline' in pdf_response.headers['content-disposition']
        reader = PdfReader(io.BytesIO(pdf_response.body()))
        pdf_text = '\n'.join(page.extract_text() for page in reader.pages)
        assert 'Cliente QA de facturación' in pdf_text
        assert '3,256.80' in pdf_text
        presentation_text = (pdf_text + str(reader.metadata)).lower()
        assert all(term not in presentation_text for term in ['sin validez', 'de prueba', 'demostración', 'muestra', 'ejemplo', 'sunat', 'demo-'])
        assert result['serie'] == 'F001' and 1 <= result['correlativo'] <= 99999999
        reference = f"F001-{result['correlativo']:08d}"
        assert reference in pdf_text
        assert 'ELECTRÓNICA' in pdf_text and 'IMPORTE EN LETRAS:' in pdf_text
        with page.expect_download() as download:
            page.get_by_role('link', name='Descargar', exact=True).click()
        download.value.save_as(out / 'descarga-web.pdf')
        assert (out / 'descarga-web.pdf').read_bytes().startswith(b'%PDF')
        page.evaluate('window.scrollTo(0, 0)')
        page.screenshot(path=str(out / 'facturacion-escritorio.png'), full_page=True)
        page.get_by_label('Buscar comprobantes').fill('Cliente QA')
        expect(page.get_by_role('cell').filter(has_text='Cliente QA de facturación')).to_be_visible()
        page.get_by_label('Precio unitario 1', exact=True).fill('2600')
        expect(page.get_by_title('Vista previa del comprobante PDF')).to_have_count(0)
        page.get_by_role('button', name='Guardar cambios', exact=True).click()
        expect(page.get_by_role('status').filter(has_text='guardado')).to_be_visible(timeout=30000)
        expect(page.get_by_role('link', name='Descargar', exact=True)).to_be_visible(timeout=30000)
        changed = request.get(f'{BASE}/api/facturacion', headers=headers).json()
        updated = next(f for f in changed if f['id'] == record_id)
        assert updated['datos']['lineas'][0]['precio'] == 2600
        assert updated['numero'] == result['numero']
        assert updated['serie'] == result['serie'] and updated['correlativo'] == result['correlativo']
        changed_type = dict(updated['datos'])
        changed_type['tipo'] = 'Boleta'
        assert request.put(f'{BASE}/api/facturacion/{record_id}', headers=headers, data=changed_type).status == 409
        # Dos emisiones simultáneas reciben correlativos distintos y consecutivos.
        concurrent = page.evaluate("""async datos => {
          return Promise.all([1, 2].map(async () => {
            const r = await fetch('/api/facturacion', {method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+localStorage.getItem('accessToken')}, body:JSON.stringify(datos)});
            return {status:r.status, body:await r.json()};
          }));
        }""", updated['datos'])
        for response in concurrent:
            if response['status'] == 201: extra_ids.append(response['body']['id'])
        assert all(r['status'] == 201 for r in concurrent), concurrent
        numbers = sorted(r['body']['correlativo'] for r in concurrent)
        assert numbers[1] == numbers[0] + 1 and numbers[0] > result['correlativo']
        boleta_response = request.post(f'{BASE}/api/facturacion', headers=headers, data=changed_type)
        assert boleta_response.status == 201
        boleta = boleta_response.json()
        extra_ids.append(boleta['id'])
        assert boleta['serie'] == 'B001' and boleta['correlativo'] >= 1
        boleta_pdf = request.get(f"{BASE}/api/facturacion/{boleta['id']}/pdf", headers=headers)
        boleta_text = '\n'.join(p.extract_text() for p in PdfReader(io.BytesIO(boleta_pdf.body())).pages)
        assert f"B001-{boleta['correlativo']:08d}" in boleta_text and 'BOLETA DE VENTA' in boleta_text
        invalid = dict(updated['datos'])
        invalid['igv'] = -1
        assert request.post(f'{BASE}/api/facturacion', headers=headers, data=invalid).status == 400
        for width in [390, 768]:
            page.set_viewport_size({'width': width, 'height': 844})
            page.wait_for_load_state('networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Horizontal overflow at {width}'
            page.evaluate('window.scrollTo(0, 0)')
            page.screenshot(path=str(out / f'facturacion-{width}.png'), full_page=True)
        # La portada tiene vídeo continuo; comprobar el contenido sin esperar
        # que termine todo el tráfico de recursos multimedia.
        page.goto(BASE, wait_until='domcontentloaded')
        expect(page.get_by_role('link', name='¿Eres administrador?', exact=True).first).to_be_visible()
        expect(page.get_by_role('contentinfo')).to_be_visible()
        assert not errors, errors
        print('OK: acceso, validación, formulario, vista previa, guardado, edición, búsqueda, descarga y diseño adaptable.')
    finally:
        for extra_id in extra_ids:
            assert request.delete(f'{BASE}/api/facturacion/{extra_id}', headers=headers).status == 200
        if record_id:
            response = request.delete(f'{BASE}/api/facturacion/{record_id}', headers=headers)
            assert response.status == 200
            assert request.get(f'{BASE}/api/facturacion/{record_id}/pdf', headers=headers).status == 404
        after = request.get(f'{BASE}/api/facturacion', headers=headers).json()
        assert len(after) == len(before), 'La prueba debe dejar el historial como estaba'
        browser.close()
