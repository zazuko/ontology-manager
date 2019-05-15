module.exports = {
  "__version": "3.2.0",
  "Proposal": {
    "create class proposal": {
      "submits a proposal": {
        "1": "{\"action\":\"createBranch\",\"payload\":{\"ref\":\"refs/heads/BRANCH_NAME\",\"owner\":\"vhf\",\"repo\":\"o\"}}\n{\"action\":\"updateFile\",\"payload\":{\"path\":\"ontology.nt\",\"owner\":\"vhf\",\"repo\":\"o\",\"message\":\"ontology: add class 'Cargo bike'\",\"branch\":\"BRANCH_NAME\",\"committer\":{\"name\":\"Ontology Editor\",\"email\":\"victor.felder@zazuko.com\",\"date\":\"SOME_DATE\"},\"author\":{\"name\":\"e2e test user\",\"email\":\"e2e@example.com\"}}}\n{\"action\":\"createPR\",\"payload\":{\"head\":\"BRANCH_NAME\",\"base\":\"example-com\",\"maintainer_can_modify\":true,\"owner\":\"vhf\",\"repo\":\"o\"}}\n"
      }
    }
  },
  "Search": {
    "should be available on homepage": {
      "1": [
        "Cargo Handlers Pouch\n       \n          Pouch",
        "Cargo Type\n       \n          Property",
        "Cargo Weight\n       \n          Property"
      ],
      "2": [
        "Cargo Weight\n       \n          Property"
      ],
      "3": [
        "netWeight\n       \n          Property",
        "grossWeight\n       \n          Property",
        "AWB Total Weight\n       \n          Property",
        "AWB Total Weight UoM\n       \n          Property",
        "AWB Manifested Weight\n       \n          Property",
        "Cargo Weight\n       \n          Property"
      ]
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
