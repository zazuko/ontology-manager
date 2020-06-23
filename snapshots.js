module.exports = {
  "__version": "4.8.0",
  "Proposal": {
    "create class proposal": {
      "submits a proposal": {
        "1": "{\"action\":\"createBranch\",\"payload\":{\"ref\":\"refs/heads/BRANCH_NAME\",\"owner\":\"vhf\",\"repo\":\"o\"}}\n{\"action\":\"updateFile\",\"payload\":{\"path\":\"ontology.nt\",\"owner\":\"vhf\",\"repo\":\"o\",\"message\":\"ontology: add class 'Cargo bike'\",\"branch\":\"BRANCH_NAME\",\"committer\":{\"name\":\"Ontology Manager\",\"email\":\"victor.felder@zazuko.com\",\"date\":\"SOME_DATE\"},\"author\":{\"name\":\"e2e test user\",\"email\":\"e2e@example.com\"}}}\n{\"action\":\"createPR\",\"payload\":{\"head\":\"BRANCH_NAME\",\"base\":\"example-com\",\"maintainer_can_modify\":true,\"owner\":\"vhf\",\"repo\":\"o\"}}\n"
      }
    }
  },
  "Structure": {
    "Shows all pouches on homepage": {
      "1": [
        "Container",
        "Maritime Pouch",
        "Cargo Handlers Pouch",
        "Carriers Pouch",
        "Customs Pouch",
        "Forwarder Pouch",
        "Rail Pouch",
        "Shippers Pouch",
        "Truckers Pouch",
        "Status Update Pouch",
        "Track Update Pouch"
      ]
    },
    "Nests properly": {
      "1": [
        "Deeper Container"
      ],
      "2": [
        "Maritime Pouch"
      ]
    },
    "Loads a pouch": {
      "1": [
        "Light",
        "TrackUpdate"
      ]
    },
    "Navigates to a pouch": {
      "1": [
        "Light",
        "TrackUpdate"
      ]
    }
  }
}
