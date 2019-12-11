import cloneDeep from 'lodash/cloneDeep'
import _get from 'lodash/get'

export default {
  mounted () {
    this.initCommon()
    this.init()
    if (process.browser && this.readonly !== true) {
      setTimeout(() => {
        this.waitForYate = setInterval(() => {
          if (window.YATE && this.$refs.exampleTextarea && this.proposalObject.label) {
            clearInterval(this.waitForYate)
            this.yate = window.YATE.fromTextArea(this.$refs.exampleTextarea, {
              readOnly: this.readonly,
              value: this.proposalObject.example
            })
            this.yate.on('change', cm => {
              this.proposalObject.example = cm.getValue()
            })
          }
        }, 300)
      }, 300)
    }
  },
  beforeDestroy () {
    clearInterval(this.waitForYate)
  },
  computed: {
    proposalObject () {
      if (process.server) {
        return _get(this.$store.state, this.storePath)
      }
      return this.$deepModel(this.storePath)
    },
    datasets () {
      return this.proposalObject.proposalDataset(false)
    },
    mergedDatasets () {
      const datasets = this.datasets
      return {
        ontology: datasets.ontology.merge(this.ontology),
        structure: datasets.structure.merge(this.structure)
      }
    }
  },
  methods: {
    _get,
    $vuexPush (path, ...values) {
      const currentValues = this.proposalObject[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.concat(values))
    },
    $vuexDeleteAtIndex (path, index) {
      const currentValues = this.proposalObject[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.filter((nothing, i) => i !== index))
    },
    initCommon () {
      if (this.baseDatasets) {
        this.ontology = this.baseDatasets.ontology
        this.structure = this.baseDatasets.structure
      }
      else {
        this.ontology = this.$store.getters['graph/ontology']
        this.structure = this.$store.getters['graph/structure']
      }
      this.schemaTree = cloneDeep(this.$store.state.graph.schemaTree)
      this.classesSearch = this.$domainsSearchFactory(this.ontology, 'Class', true)
      this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
    }
  }
}
