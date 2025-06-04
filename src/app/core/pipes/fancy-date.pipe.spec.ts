import { FancyDatePipe } from './fancy-date.pipe';

describe('FancyDatePipe', () => {
  it('create an instance', () => {
    const pipe = new FancyDatePipe();
    expect(pipe).toBeTruthy();
  });
});
