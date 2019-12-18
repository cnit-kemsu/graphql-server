import { escape } from '../../escape';

test(`Test result`, () => {
  escape(`"john" %_ 'cooper'`)
  |> expect(#).toBe(`"\\"john\\" %_ 'cooper'"`);
});