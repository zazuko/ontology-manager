module.exports = {
  "__version": "3.8.2",
  "Proposal": {
    "create class proposal": {
      "submits a proposal": {
        "1": "{\"action\":\"createBranch\",\"payload\":{\"ref\":\"refs/heads/BRANCH_NAME\",\"owner\":\"vhf\",\"repo\":\"o\"}}\n{\"action\":\"updateFile\",\"payload\":{\"path\":\"ontology.nt\",\"owner\":\"vhf\",\"repo\":\"o\",\"message\":\"ontology: add class 'Cargo bike'\",\"branch\":\"BRANCH_NAME\",\"committer\":{\"name\":\"Ontology Manager\",\"email\":\"victor.felder@zazuko.com\",\"date\":\"SOME_DATE\"},\"author\":{\"name\":\"e2e test user\",\"email\":\"e2e@example.com\"}}}\n{\"action\":\"createPR\",\"payload\":{\"head\":\"BRANCH_NAME\",\"base\":\"example-com\",\"maintainer_can_modify\":true,\"owner\":\"vhf\",\"repo\":\"o\"}}\n"
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
        "Height\n       \n          Property",
        "netWeight\n       \n          Property",
        "grossWeight\n       \n          Property",
        "AWB Total Weight\n       \n          Property",
        "AWB Total Weight UoM\n       \n          Property",
        "AWB Manifested Weight\n       \n          Property",
        "Cargo Weight\n       \n          Property",
        "Shippers Instruction\n       \n          Need a good definition. Here is one from shippingsolutions.com - The Shipper's Letter of Instruction helps to convey specific instructions from the exporter to his agent, usually an international freight forwarder.",
        "Carriers Pouch\n       \n          A pouch is an entity we use to logically group data elements together for the role in the logistics chain that predominantly would provide the data.  It is intended to enably a quick access to schema needed. For the Carriers Pouch, you will find data typically from the following documents; Flight Manifest, Freight Booked List, NOTOC."
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
