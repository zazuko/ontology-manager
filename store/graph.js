export const state = () => ({
  baseDataset: {}
})

export const mutations = {
  setBase (state, dataset) {
    state.baseDataset = dataset
  }
}
