import axios from 'axios';
import fetchCategories, { categoriesItunesUrl } from '../fetchCategories';

import { rawData, rawCategories } from '../../seeds/categories';

jest.mock('axios');

describe('fetchCategories', () => {
  it('fetches data from iTunes', async () => {
    // setup
    axios.get.mockResolvedValue({
      data: rawData,
    });

    // work
    const categories = await fetchCategories();

    // expect
    expect(categories).toEqual(rawCategories);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(categoriesItunesUrl);
  });
});
