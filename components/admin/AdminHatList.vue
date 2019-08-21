<template>
  <div>
    <div class="layout-admin-panel columns is-hidden-mobile">
      <div class="column">
        <p>
          A hat is a badge a user can use when they want to speak in the name of
          an organization they represent.
        </p>
        <p>
          Users can have multiple hats but they can only wear one hat at a time
          and only if they chose to do so, when posting comments.
        </p>
      </div>
      <div class="column">
        <div class="has-text-right">
          <a
            @click.prevent="openForm"
            class="button is-info">
            Create New Hat
          </a>
        </div>

        <div
          class="hats-form"
          v-show="hatForm || editingHatId">
          <div class="field">
            <label class="label">
              Hat Title
            </label>
            <div class="control">
              <input
                type="text"
                class="input"
                placeholder="title"
                v-model="hatTitle">
            </div>
          </div>
          <div class="field">
            <label class="label">
              Description
            </label>
            <div class="control">
              <textarea
                class="textarea"
                placeholder="description"
                rows="3"
                v-model="hatDescription" />
            </div>
          </div>

          <div
            class="field">
            <label class="label">
              Hat Holders
            </label>
            <div class="control">
              <div
                v-if="editingHatId"
                class="select is-multiple is-fullwidth">
                <select
                  :size="users.length < 8 ? users.length : 8"
                  v-model="selectedUserIds"
                  multiple>
                  <option
                    v-for="user in users"
                    :key="user.id"
                    :value="user.id">
                    {{ user.name }}
                  </option>
                </select>
              </div>
              <div
                v-else
                class="select is-multiple is-fullwidth">
                <select
                  :size="users.length < 8 ? users.length : 8"
                  v-model="selectedUserIds"
                  multiple>
                  <option
                    v-for="user in users"
                    :key="user.id"
                    :value="user.id">
                    {{ user.name }}
                  </option>
                </select>
              </div>
            </div>
            <small>Control-click (Windows) or command-click (Mac) to select more than one.</small>
          </div>

          <div class="field is-grouped">
            <div class="control">
              <button
                v-if="editingHatId"
                @click.prevent="updateHat"
                class="button is-info">
                Update
              </button>
              <button
                v-else
                @click.prevent="createHat"
                class="button is-info">
                Create
              </button>
              <button
                @click.prevent="clear"
                class="button is-dark-info">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <table class="table admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Holders</th>
            <th class="is-hidden-mobile"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="hat in hats"
            :key="hat.id">
            <td>
              <p>{{ hat.title }}</p>
            </td>
            <td>
              {{ hat.description }}
            </td>
            <td>
              <ul>
                <li
                  v-for="person in _get(hat, 'holders.persons', []).map(({ person }) => person)"
                  :key="person.id">
                  <span
                    class="icon has-text-danger clickable-pointer"
                    title="Remove hat from this person"
                    @click.prevent="removeHat(person.id, hat.id)">
                    <account-off />
                  </span>
                  {{ person.name }}
                </li>
              </ul>
            </td>
            <td class="has-text-right is-hidden-mobile">
              <button
                class="button is-small is-info"
                @click.prevent="edit(hat)">
                Grant
              </button>
              <button
                class="button is-small is-info"
                @click.prevent="edit(hat)">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import _get from 'lodash/get'
import createHat from '@/apollo/mutations/adminCreateHat'
import updateHat from '@/apollo/mutations/adminUpdateHat'
import grantHat from '@/apollo/mutations/adminGrantHat'
import removeHat from '@/apollo/mutations/adminRemoveHat'
import AccountOff from 'vue-material-design-icons/AccountOff.vue'

export default {
  name: 'AdminHatList',
  components: {
    AccountOff
  },
  props: {
    hats: {
      type: Array,
      required: true,
      default () {
        return []
      }
    },
    users: {
      type: Array,
      required: true,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      hatTitle: '',
      hatDescription: '',
      selectedUserIds: [],
      editingHatId: null,
      hatForm: false
    }
  },
  methods: {
    _get,
    edit (hat) {
      this.editingHatId = hat.id
      this.hatTitle = hat.title
      this.hatDescription = hat.description
      this.selectedUserIds = _get(hat, 'holders.persons', []).map(({ person }) => person.id)
    },
    async updateHat () {
      const variables = {
        title: this.hatTitle,
        description: this.hatDescription,
        hatId: this.editingHatId
      }

      try {
        await this.$apollo.mutate({ mutation: updateHat, variables })
        await this.grantHat(this.editingHatId, this.selectedUserIds)
        this.clear()
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
      }

      this.$emit('updated')
    },
    async createHat () {
      const variables = {
        title: this.hatTitle,
        description: this.hatDescription
      }

      try {
        const result = await this.$apollo.mutate({ mutation: createHat, variables })
        const createdHatId = result.data.createHat.hat.id
        await this.grantHat(createdHatId, this.selectedUserIds)
        this.clear()
      }
      catch (err) {
        // TODO: error handling: show error message for instance for duplicate key value error
        // (title is UNIQUE)
        console.error(err)
        this.$sentry.captureException(err)
      }

      this.$emit('updated')
    },
    async removeHat (personId, hatId) {
      const variables = {
        hatId,
        personId
      }

      try {
        await this.$apollo.mutate({ mutation: removeHat, variables })
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
      }

      this.$emit('updated')
    },
    async grantHat (hatId, personIds) {
      const promises = personIds.map((userId) => {
        const variables = {
          hatId,
          personId: userId
        }
        return this.$apollo.mutate({ mutation: grantHat, variables })
      })
      return Promise.all(promises)
    },
    openForm () {
      this.clear()
      this.hatForm = true
    },
    clear () {
      this.hatTitle = ''
      this.hatDescription = ''
      this.selectedUserIds = []
      this.editingHatId = null
      this.hatForm = false
    }
  }
}
</script>

<style scoped>
.admin-action {
  min-width: 68px;
}
.admin-flag {
  min-width: 36px;
}
</style>
