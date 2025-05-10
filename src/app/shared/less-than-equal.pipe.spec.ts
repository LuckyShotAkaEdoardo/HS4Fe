import { LessThanEqualPipe } from './less-than-equal.pipe';

describe('LessThanEqualPipe', () => {
  it('create an instance', () => {
    const pipe = new LessThanEqualPipe();
    expect(pipe).toBeTruthy();
  });
});
