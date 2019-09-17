/* eslint-disable import/no-cycle */
import auth from './auth';
import episode from './episode';
import podcast from './podcast';
import dataPopulation from './dataPopulation';

const Mutation = {
  ...auth,
  ...episode,
  ...podcast,
  ...dataPopulation,
};

export default Mutation;
