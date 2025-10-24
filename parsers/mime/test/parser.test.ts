import { expect, test } from 'vitest';
import { parse } from '#parser';

test('should parse the most basic MIME-type', () => {
  expect(parse('text/html')).toEqual({
    essence: 'text/html',
    type: 'text',
    subtype: 'html',
    subtypeTokens: { tree: null, name: 'html', suffix: null },
    parameters: new Map(),
  });
});

test('should parse overcomplicated MIME-type', () => {
  expect(
    parse(
      '  apPlIcaTion/emergencycAlldata.deviceiNfo+xMl;  chaRset=utf-8   ;foo=bAr "  azAz ; kEk  =foo ;  ror ="lol fof \\"  ";bruh=""; oraoraora  = ; foo=   ; fufufu =1     ',
    ),
  ).toEqual({
    essence: 'application/emergencycalldata.deviceinfo+xml',
    type: 'application',
    subtype: 'emergencycalldata.deviceinfo+xml',
    subtypeTokens: {
      tree: 'emergencycalldata',
      name: 'deviceinfo',
      suffix: 'xml',
    },
    parameters: new Map([
      ['charset', 'utf-8'],
      ['foo', 'bAr "  azAz'],
      ['kek  ', 'foo'],
      ['ror ', 'lol fof \\"  '],
      ['fufufu ', '1'],
    ]),
  });
});

test('should lowercase essence');
