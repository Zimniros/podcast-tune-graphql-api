import fetchCategories from '../fetchCategories';
import getCategories from '../getCategories';

import { rawCategories, prettifiedCategories } from '../../seeds/categories';

jest.mock('./../fetchCategories');

describe('getCategories', () => {
  it('calls fetchCategories and returns prettified data', async () => {
    // setup
    fetchCategories.mockResolvedValue(rawCategories);

    // work
    const categories = await getCategories();

    // expect
    expect(categories).toEqual(prettifiedCategories);
    expect(fetchCategories).toHaveBeenCalledTimes(1);
  });
});
