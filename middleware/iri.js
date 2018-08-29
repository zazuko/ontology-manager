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
  /**
   * We only enter this middleware when trifid didn't intercept the request.
   * If we're here, we either want to show a nuxt page or fallback to displaying the HTML
   * version of the dereferenced iri we are extracting here from the request.
   */
  if (context.req && context.req._iri) {
    context.iri = context.req._iri
  }
}
