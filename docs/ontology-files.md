---
title: Ontology Files
nav_order: 300
has_children: false
has_toc: true
---

# Ontology Files

## Introduction

The ontology manager stores the ontology on GitHub. (Supporting other forges such as GitLab is fairly simple but we haven't yet had the need.)

For instance, [editor.zazuko.com](http://editor.zazuko.com) reads its content from <https://github.com/zazuko/zom-ontology-demo>.
When the ontology is modified via the ontology manager, it writes the changes to the GitHub repo.
The ontology is modified by accepting a *proposal*.
When a proposal is accepted, commits are automatically created on the GitHub repository and attributed to the ontology manager user who accepted the proposal.

## Files

The Ontology Manager needs two files: one for the "structure" and one for the actual content of the ontology.
These two files, [ontology](#ontology-file) and [structure](#structure-file) need to be stored on the GitHub repository.

The repository location, branch name and file names can be changed in the manager settings:

![ontology configuration in admin > manager settings](https://user-images.githubusercontent.com/2022803/72455772-b307ba80-37c3-11ea-8301-27ad3581fd12.png)

### Ontology File

The ontology file contains the ontology created or managed by the Ontology Manager.

Here are the most important RDF terms used by the Ontology Manager:

* `rdf:type` (`http://www.w3.org/1999/02/22-rdf-syntax-ns#type`)
* `rdfs:Datatype` (`http://www.w3.org/2000/01/rdf-schema#Datatype`)
* `rdf:Property` (`http://www.w3.org/1999/02/22-rdf-syntax-ns#Property`)
* `rdfs:Class` (`http://www.w3.org/2000/01/rdf-schema#Class`)
* `rdfs:label` (`http://www.w3.org/2000/01/rdf-schema#label`)
* `rdfs:comment` (`http://www.w3.org/2000/01/rdf-schema#comment`)
* `skos:note` (`http://www.w3.org/2004/02/skos/core#note`)
* `skos:example` (`http://www.w3.org/2004/02/skos/core#example`)
* `schema:domainIncludes` (`http://schema.org/domainIncludes`)
* `schema:rangeIncludes` (`http://schema.org/rangeIncludes`)
* `rdfs:subClassOf` (`http://www.w3.org/2000/01/rdf-schema#subClassOf`)
* `rdfs:subPropertyOf` (`http://www.w3.org/2000/01/rdf-schema#subPropertyOf`)
* `owl:equivalentClass` (`http://www.w3.org/2002/07/owl#equivalentClass`)
* `owl:equivalentProperty` (`http://www.w3.org/2002/07/owl#equivalentProperty`)

Configuring the Ontology Manager to use an empty ontology file is fine if you want to start an ontology with a blank slate.

### Structure File

### Concept

We noticed it is often easier to work on an ontology by grouping Classes and Properties into an overarching, artificial structure that should not be part of the ontology.
The structure is a helpful organizing tool, it should not have any semantic.
Think of the structure as something used to group Classes and Properties, displaying them in their respective groups in the ontology manager interface. Note that a Class or Property can be part of more than one group.

Examples:

* If you were in charge of the [schema.org ontology](https://schema.org/docs/full.html), you might want two groups: *Things* and *Data Types*.
* The [QUDT catalog](http://www.qudt.org/2.1/catalog/qudt-catalog.html) could use the following structure:
    * Schemas
        * QUDT
        * Datatypes
        * Science
    * Vocabularies
        * Quantity Kind Dimension Vectors
        * Quantity Kinds
        * Units
        * Constants
        * Disciplines
        * Dimensionless Units
* Some companies or organizations might want to work on an ontology by grouping it into sectors (sales, engineering, …) or by which administrative division is responsible to maintain what part of the ontology.

### Content

The structure file uses 4 predicates:

* `http://schema.org/hasPart`
    This predicate is used to file objects into groups (into groups, …). It can be configured in the Manager Settings.
* `http://www.w3.org/1999/02/22-rdf-syntax-ns#type`
* `http://www.w3.org/2000/01/rdf-schema#comment`
* `http://www.w3.org/2000/01/rdf-schema#label`

Here's a commented sample "group":

```
// a group is alway `a schema:CreativeWork`
<http://example.com/games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
// it has a name
<http://example.com/games/> <http://www.w3.org/2000/01/rdf-schema#label> "Games" .
// and a description
<http://example.com/games/> <http://www.w3.org/2000/01/rdf-schema#comment> "A lot of fun, sometimes" .
// `schema:hasPart` is used to file things into this group, these things can either be
// other groups, or rdfs:Classes
<http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/board-games/> .
<http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/card-games/> .
<http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/dice-games/> .
```

All groups have to be defined in the structure file, groups defined in the ontology file will not be taken into account.
A group can contain one of these two: more groups, or Classes defined in the ontology file.

Here is a complete example to generate this structure:

![structure screenshot](https://user-images.githubusercontent.com/2022803/72528903-6d52fc80-386c-11ea-9e95-d5a9da74df1d.png)

```
<http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/board-games/> .
<http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/card-games/> .
<http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/dice-games/> .
<http://example.com/games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
<http://example.com/games/> <http://www.w3.org/2000/01/rdf-schema#comment> "A lot of fun, sometimes" .
<http://example.com/games/> <http://www.w3.org/2000/01/rdf-schema#label> "Games" .
<http://example.com/games/board-games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
<http://example.com/games/board-games/> <http://www.w3.org/2000/01/rdf-schema#comment> "Games played on a board" .
<http://example.com/games/board-games/> <http://www.w3.org/2000/01/rdf-schema#label> "Board Games" .
<http://example.com/games/card-games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
<http://example.com/games/card-games/> <http://www.w3.org/2000/01/rdf-schema#comment> "Games played with cards" .
<http://example.com/games/card-games/> <http://www.w3.org/2000/01/rdf-schema#label> "Card Games" .
<http://example.com/games/dice-games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
<http://example.com/games/dice-games/> <http://www.w3.org/2000/01/rdf-schema#comment> "Games played with dice" .
<http://example.com/games/dice-games/> <http://www.w3.org/2000/01/rdf-schema#label> "Dice Games" .
<http://example.com/sports/> <http://schema.org/hasPart> <http://example.com/sports/individual-sports/> .
<http://example.com/sports/> <http://schema.org/hasPart> <http://example.com/sports/team-sports/> .
<http://example.com/sports/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
<http://example.com/sports/> <http://www.w3.org/2000/01/rdf-schema#comment> "A bunch of sports" .
<http://example.com/sports/> <http://www.w3.org/2000/01/rdf-schema#label> "Sports" .
<http://example.com/sports/individual-sports/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
<http://example.com/sports/individual-sports/> <http://www.w3.org/2000/01/rdf-schema#comment> "Sports played individually" .
<http://example.com/sports/individual-sports/> <http://www.w3.org/2000/01/rdf-schema#label> "Individual Sports" .
<http://example.com/sports/team-sports/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
<http://example.com/sports/team-sports/> <http://www.w3.org/2000/01/rdf-schema#comment> "Sports played as a team" .
<http://example.com/sports/team-sports/> <http://www.w3.org/2000/01/rdf-schema#label> "Team Sports" .
```

From there, you could either start with an empty ontology file or add some sample content to your ontology file:

```
<http://example.com/schema/RockClimbing> <http://purl.org/dc/terms/modified> "2018-02-23"^^<http://www.w3.org/2001/XMLSchema#date> .
<http://example.com/schema/RockClimbing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://example.com/schema/RockClimbing> <http://www.w3.org/2000/01/rdf-schema#comment> "A sport where the goal is to climb." .
<http://example.com/schema/RockClimbing> <http://www.w3.org/2000/01/rdf-schema#label> "Rock Climbing" .
```

and display RockClimbing into IndividualSport by adding to the structure file:

```
<http://example.com/sports/individual-sports/> <http://schema.org/hasPart> <http://example.com/schema/RockClimbing> .
```

(Note: running the ontology manager with the environment variable `DEBUG=editor:*` to see RDF parsing errors is useful when you are setting up brand new files. The ontology manager won't create invalid n-triples but when you are experimenting with different things by directly pushing files to GitHub, please keep this in mind. Remember to turn debugging of when you go live.)

At this point you will have the following, one object in the "Individual Sports" group.

<img width="439" alt="Screen Shot 2020-01-16 at 14 31 16" src="https://user-images.githubusercontent.com/2022803/72529217-b901a800-3864-11ea-890a-7eb9010dd55b.png">

Clicking on Individual Sports leads to its content:

<img width="646" alt="Screen Shot 2020-01-21 at 11 10 13" src="https://user-images.githubusercontent.com/2022803/72795962-6ba38300-3c36-11ea-82f2-3c2d45360003.png">

Clicking on Rock Climbing shows:

<img width="853" alt="Screen Shot 2020-01-21 at 11 11 08" src="https://user-images.githubusercontent.com/2022803/72795960-6ba38300-3c36-11ea-8a49-c0672a81fa67.png">

Obviously the purpose of the Ontology Manager is to create and modify an ontology without writing triples by hand. Instead of manually creating the *Rock Climbing* class, we should have navigated to the wanted "group" and created it there. Here is an example where we went to "Team Sports" and used the "Request New Class" button to create a class representing *Curling*:

<img width="599" alt="Screen Shot 2020-01-21 at 13 35 31" src="https://user-images.githubusercontent.com/2022803/72805772-8b917180-3c4b-11ea-9017-4e2ddd240c30.png">

When an admin decides to *Accept* this proposal, two commits get created on GitHub, one modifying the Ontology File, the other modifying the Structure File:

```diff
+<http://example.com/schema/Curling> <http://purl.org/dc/terms/modified> "2020-01-21"^^<http://www.w3.org/2001/XMLSchema#date> .
+<http://example.com/schema/Curling> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
+<http://example.com/schema/Curling> <http://www.w3.org/2000/01/rdf-schema#comment> "This class represents the sport named curling" .
+<http://example.com/schema/Curling> <http://www.w3.org/2000/01/rdf-schema#label> "Curling" .
 <http://example.com/schema/RockClimbing> <http://purl.org/dc/terms/modified> "2019-10-22"^^<http://www.w3.org/2001/XMLSchema#date> .
 <http://example.com/schema/RockClimbing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
 <http://example.com/schema/RockClimbing> <http://www.w3.org/2000/01/rdf-schema#comment> "A sport where the goal is to climb." .
 <http://example.com/schema/RockClimbing> <http://www.w3.org/2000/01/rdf-schema#label> "Rock Climbing" .
```

```diff
 <http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/board-games/> .
 <http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/card-games/> .
 <http://example.com/games/> <http://schema.org/hasPart> <http://example.com/games/dice-games/> .
 <http://example.com/games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
 <http://example.com/games/> <http://www.w3.org/2000/01/rdf-schema#comment> "A lot of fun, sometimes" .
 <http://example.com/games/> <http://www.w3.org/2000/01/rdf-schema#label> "Games" .
 <http://example.com/games/board-games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
 <http://example.com/games/board-games/> <http://www.w3.org/2000/01/rdf-schema#comment> "Games played on a board" .
 <http://example.com/games/board-games/> <http://www.w3.org/2000/01/rdf-schema#label> "Board Games" .
 <http://example.com/games/card-games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
 <http://example.com/games/card-games/> <http://www.w3.org/2000/01/rdf-schema#comment> "Games played with cards" .
 <http://example.com/games/card-games/> <http://www.w3.org/2000/01/rdf-schema#label> "Card Games" .
 <http://example.com/games/dice-games/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
 <http://example.com/games/dice-games/> <http://www.w3.org/2000/01/rdf-schema#comment> "Games played with dice" .
 <http://example.com/games/dice-games/> <http://www.w3.org/2000/01/rdf-schema#label> "Dice Games" .
 <http://example.com/sports/> <http://schema.org/hasPart> <http://example.com/sports/individual-sports/> .
 <http://example.com/sports/> <http://schema.org/hasPart> <http://example.com/sports/team-sports/> .
 <http://example.com/sports/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
 <http://example.com/sports/> <http://www.w3.org/2000/01/rdf-schema#comment> "A bunch of sports" .
 <http://example.com/sports/> <http://www.w3.org/2000/01/rdf-schema#label> "Sports" .
 <http://example.com/sports/individual-sports/> <http://schema.org/hasPart> <http://example.com/schema/RockClimbing> .
 <http://example.com/sports/individual-sports/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
 <http://example.com/sports/individual-sports/> <http://www.w3.org/2000/01/rdf-schema#comment> "Sports played individually" .
 <http://example.com/sports/individual-sports/> <http://www.w3.org/2000/01/rdf-schema#label> "Individual Sports" .
+<http://example.com/sports/team-sports/> <http://schema.org/hasPart> <http://example.com/schema/Curling> .
 <http://example.com/sports/team-sports/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/CreativeWork> .
 <http://example.com/sports/team-sports/> <http://www.w3.org/2000/01/rdf-schema#comment> "Sports played as a team" .
 <http://example.com/sports/team-sports/> <http://www.w3.org/2000/01/rdf-schema#label> "Team Sports" .
```
