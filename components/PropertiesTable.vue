<template>
  <table class="table is-fullwidth">
    <thead>
      <tr>
        <th>
          Property
        </th>
        <th>
          Type
        </th>
        <th>
          Description
          <br>
          <small>short description</small>
        </th>
        <th>
          Used On
          <br>
          <small>these classes</small>
        </th>
        <th>
          Remove
          <br>
          <small>from class being created</small>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(property, index) in properties"
        :key="index">
        <td>
          <small>
            <code>{{ property.domain.subject.value }}</code>
          </small>
        </td>
        <td>
          <small>
            <code>{{ property.range }}</code>
          </small>
        </td>
        <td>
          {{ property.label }}
        </td>
        <td>
          <ul>
            <li
              v-for="otherClass in property.usedOn"
              :key="otherClass.object.value">
              <small>
                <code>{{ otherClass.object.value }}</code>
              </small>
            </li>
          </ul>
        </td>
        <td>
          <!-- TODO: what would 'edit' do here? -->
          <!-- <span
            class="panel-icon">
            <i class="mdi mdi-pencil" />
          </span> -->
          <span
            class="panel-icon"
            @click.prevent="$emit('delete', index)">
            <i class="mdi mdi-close-circle" />
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'PropertiesTable',
  props: {
    properties: {
      type: Array,
      required: true
    }
  }
}
</script>
