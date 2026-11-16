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
        expect(page.get_by_role('heading', name='Facturación', exact=True)).to_be_visible()
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
        assert '001-' in pdf_text
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
        if record_id:
            response = request.delete(f'{BASE}/api/facturacion/{record_id}', headers=headers)
            assert response.status == 200
            assert request.get(f'{BASE}/api/facturacion/{record_id}/pdf', headers=headers).status == 404
        after = request.get(f'{BASE}/api/facturacion', headers=headers).json()
        assert len(after) == len(before), 'La prueba debe dejar el historial como estaba'
        browser.close()
