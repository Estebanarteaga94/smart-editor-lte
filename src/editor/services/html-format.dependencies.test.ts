import { describe, expect, it } from 'vitest';

import * as prettier from 'prettier/standalone';
import htmlPlugin from 'prettier/plugins/html';

describe('HTML formatting dependencies', () => {
  it('can format HTML in the browser bundle with Prettier standalone and the HTML plugin', async () => {
    const formatted = await prettier.format('<ul><li>Uno</li><li>Dos</li></ul>', {
      parser: 'html',
      plugins: [htmlPlugin],
    });

    expect(formatted).toBe('<ul>\n  <li>Uno</li>\n  <li>Dos</li>\n</ul>\n');
  });
});
