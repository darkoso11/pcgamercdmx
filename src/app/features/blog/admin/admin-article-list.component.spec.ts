import { of, Subject, throwError } from 'rxjs';
import { AdminArticleListComponent } from './admin-article-list.component';

describe('Administrative blog filters', () => {
  const changeDetector = () => ({ detectChanges() {}, markForCheck() {} });

  it('uses effective publication state rather than just the boolean flag', () => {
    const list = jasmine.createSpy().and.returnValue(of({ data: [], total: 0 }));
    const component = new AdminArticleListComponent({ list } as any, changeDetector() as any);
    component.filterPublished = 'false';
    component.onSearch();
    expect(list.calls.mostRecent().args[0].status).toBe('draft');
  });

  it('does not allow an older response to replace a newer search', () => {
    const old = new Subject<any>();
    const recent = new Subject<any>();
    const list = jasmine.createSpy().and.returnValues(old, recent);
    const component = new AdminArticleListComponent({ list } as any, changeDetector() as any);
    component.load();
    component.q = 'Nueva';
    component.onSearch();
    recent.next({ data: [{ title: 'Nueva' }], total: 1 });
    old.next({ data: [{ title: 'Vieja' }], total: 1 });
    expect(component.articles[0].title).toBe('Nueva');
  });

  it('rejects inverted dates without requesting misleading results', () => {
    const list = jasmine.createSpy().and.returnValue(of({ data: [], total: 0 }));
    const component = new AdminArticleListComponent({ list } as any, changeDetector() as any);
    component.filterDateFrom = '2026-10-27';
    component.filterDateTo = '2026-10-26';
    component.onSearch();
    expect(list).not.toHaveBeenCalled();
    expect((component as any).error).toContain('fecha');
  });

  it('shows a request error instead of representing it as an empty filtered list', () => {
    const component = new AdminArticleListComponent({ list: () => throwError(() => new Error('network')) } as any, changeDetector() as any);
    component.onSearch();
    expect((component as any).error).toContain('cargar');
  });
});
