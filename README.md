# Zazuko Ontology Manager

This is the open source repository of the [Zazuko Ontology Manager](https://zazuko.com/products/ontology-manager/). From our product page:

> The Zazuko Ontology Manager (ZOM) is a web application for serving, browsing and modeling RDF Schemas and Ontologies. It supports the full process of creating, publishing and extending an ontology. ZOM's user interface has been designed for teams of domain specialists working jointly on an ontology. No specific ontology modeling knowledge is required to use the editor. ZOM leverages GitHub to store the ontology, but carefully hides the complexity of serializing the schema into RDF triples from users of the editor.
> 
> We believe creating, editing, evolving an ontology is easiest done using a collaborative web platform designed specifically for this use case, allowing all actors to reach consensus gradually, using asynchronous proposals, discussions and votes.

Please consult the [product page](https://zazuko.com/products/ontology-manager/) & [this blog post](https://zazuko.com/blog/schema-manager-oss/) for details.

## Documentation

Documentation is available at [zazuko.github.io/ontology-manager/](https://zazuko.github.io/ontology-manager/).

## Helpful Tools

- Vue devtools extension [Chrome, Firefox](https://github.com/vuejs/vue-devtools#installation)
- Local GraphQL IDE: [Graph*i*QL `http://localhost:3000/graphiql`](http://localhost:3000/graphiql) (only available in dev mode)
- A postgres client (e.g. [Postico](https://eggerapps.at/postico/) for MacOS) to inspect schemas and data

## FAQ

### How to wipe a customer DB?

For customer `example_com`:
```sql
drop database example_com_db;
drop role example_com_role_postgraphile;
drop role example_com_role_anonymous;
drop role example_com_role_person;
```

### How to create a new theme?

To create a new theme, simply copy an existing theme and modify it:

1. `cp -r assets/themes/zazuko assets/themes/your-theme`
1. The scss main file/entrypoint is: `assets/themes/your-theme/theme.scss`
1. Configure nuxt to use your theme: `{ lang: 'scss', src: '@/assets/themes/your-theme/theme.scss' }` instead of `{ lang: 'scss', src: '@/assets/themes/zazuko/theme.scss' }`

## References

* GraphQL: https://graphql.org/learn/
* Postgraphile: https://www.graphile.org/postgraphile/introduction/
* Nuxt: https://nuxtjs.org/guide/installation
    * Apollo: https://github.com/nuxt-community/apollo-module
    * Auth: https://auth.nuxtjs.org/

## License

This software is released under the [GNU Affero General Public License](https://www.gnu.org/licenses/agpl-3.0.html), see [LICENSE](LICENSE) for details.
