import { CsvtestPage } from './app.po';

describe('csvtest App', function() {
  let page: CsvtestPage;

  beforeEach(() => {
    page = new CsvtestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
