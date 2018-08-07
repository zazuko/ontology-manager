export const state = () => ({
  discussions: [],
  discussionsById: {}
})

export const mutations = {
  add (state, discussion) {
    state.discussions.push(discussion)
    state.discussionsById[discussion.id] = discussion
  },
  close (state, discussions) {
    // discussion.closed = true
  }
}
