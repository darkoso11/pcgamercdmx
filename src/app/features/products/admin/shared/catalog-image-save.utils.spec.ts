import { getCatalogSaveErrorMessage } from './catalog-image-save.utils';

describe('catalog image save utils', () => {
  it('explains auth failures after automatic Directus session recovery fails', () => {
    expect(getCatalogSaveErrorMessage({ status: 401 }, 'Error al publicar el ensamble'))
      .toBe('Error al publicar el ensamble. No se pudo renovar tu sesion de Directus o tu usuario no tiene permisos; inicia sesion de nuevo.');
  });
});
