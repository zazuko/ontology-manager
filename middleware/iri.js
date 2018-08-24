/*
The IRI is set on the request by the trifid middleware.
It can be accessed in any Vue page or component this way:

async asyncData (context) {
  return {
    iri: context.iri
  }
}
*/
export default function (context) {
  if (context.req && context.req._iri) {
    console.log(`Got iri '${context.req._iri}'`)
    context.iri = context.req._iri
  }
}
