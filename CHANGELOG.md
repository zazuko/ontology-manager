<a name="0.9.90"></a>
## [0.9.90](https://github.com/zazuko/ontology-manager/compare/v0.9.89...v0.9.90) (2019-12-12)


### Bug Fixes

* **dataset:** client fetch dataset only when new version server-side ([cc0e6fe](https://github.com/zazuko/ontology-manager/commit/cc0e6fe))



<a name="0.9.89"></a>
## [0.9.89](https://github.com/zazuko/ontology-manager/compare/v0.9.88...v0.9.89) (2019-12-11)


### Bug Fixes

* **breadcrumb:** remove missing labels ([c9fb533](https://github.com/zazuko/ontology-manager/commit/c9fb533))
* **utils:** cycle detection works with brand new keys ([b5d8716](https://github.com/zazuko/ontology-manager/commit/b5d8716))
* markup fixes ([bb2d09c](https://github.com/zazuko/ontology-manager/commit/bb2d09c))
* **api:** always fetch last version from github ([0a3870a](https://github.com/zazuko/ontology-manager/commit/0a3870a))
* **index:** graphs are reactive ([2cb9d2d](https://github.com/zazuko/ontology-manager/commit/2cb9d2d))


### Features

* **schema:** schema has a version, incremented by proposals ([042f11c](https://github.com/zazuko/ontology-manager/commit/042f11c))



<a name="0.9.88"></a>
## [0.9.88](https://github.com/zazuko/ontology-manager/compare/v0.9.87...v0.9.88) (2019-12-10)


### Bug Fixes

* **graphs:** graphs are reactive and reload is smarter ([bb2a145](https://github.com/zazuko/ontology-manager/commit/bb2a145))



<a name="0.9.87"></a>
## [0.9.87](https://github.com/zazuko/ontology-manager/compare/v0.9.86...v0.9.87) (2019-12-09)


### Bug Fixes

* **proposals:** redirect to draft as soon as it's saved ([4dc1a62](https://github.com/zazuko/ontology-manager/commit/4dc1a62))


### Features

* **schema:** detect subClass cycles ([0d8b2df](https://github.com/zazuko/ontology-manager/commit/0d8b2df))



<a name="0.9.86"></a>
## [0.9.86](https://github.com/zazuko/ontology-manager/compare/v0.9.85...v0.9.86) (2019-12-05)


### Bug Fixes

* **object-details:** show parent class in breadcrumb ([f97725e](https://github.com/zazuko/ontology-manager/commit/f97725e))
* **proposals:** initialize YATE after loading proposal ([f27e234](https://github.com/zazuko/ontology-manager/commit/f27e234))
* **proposals:** remove circular subClass check for now ([99ca7d5](https://github.com/zazuko/ontology-manager/commit/99ca7d5))



<a name="0.9.85"></a>
## [0.9.85](https://github.com/zazuko/ontology-manager/compare/v0.9.84...v0.9.85) (2019-12-04)


### Bug Fixes

* **properties:** display equivalent properties in both directions ([c17203a](https://github.com/zazuko/ontology-manager/commit/c17203a))
* **properties:** equivalent property is not 'same as' ([50651fe](https://github.com/zazuko/ontology-manager/commit/50651fe))
* navigation overhaul ([a613af6](https://github.com/zazuko/ontology-manager/commit/a613af6))
* **design:** disable expanding sidenav elt w/o children ([c7f5bd8](https://github.com/zazuko/ontology-manager/commit/c7f5bd8))


### Features

* **classes:** classes can be rdfs:subClassOf ([6cd36fb](https://github.com/zazuko/ontology-manager/commit/6cd36fb))
* **classes:** classes can have 'owl:equivalentClass'es ([755bd69](https://github.com/zazuko/ontology-manager/commit/755bd69))



<a name="0.9.84"></a>
## [0.9.84](https://github.com/zazuko/ontology-manager/compare/v0.9.83...v0.9.84) (2019-11-20)


### Bug Fixes

* **design:** ensure a margin between last subform and submit buttons ([1a7cf9e](https://github.com/zazuko/ontology-manager/commit/1a7cf9e))
* **proposals:** ensure no conflicting IRIs are created from subforms ([859ea59](https://github.com/zazuko/ontology-manager/commit/859ea59))
* **proposals:** generated class IRIs are pascal case ([f8c276e](https://github.com/zazuko/ontology-manager/commit/f8c276e))
* **structure:** display objects labels instead of terms ([dd6d0f6](https://github.com/zazuko/ontology-manager/commit/dd6d0f6))
* **yate:** only instantiate when textarea is present ([8468fbc](https://github.com/zazuko/ontology-manager/commit/8468fbc))



<a name="0.9.83"></a>
## [0.9.83](https://github.com/zazuko/ontology-manager/compare/v0.9.82...v0.9.83) (2019-11-19)



<a name="0.9.82"></a>
## [0.9.82](https://github.com/zazuko/ontology-manager/compare/v0.9.81...v0.9.82) (2019-11-19)


### Bug Fixes

* **object-tree:** show pouch labels instead of iri part ([5a929fd](https://github.com/zazuko/ontology-manager/commit/5a929fd))
* **proposals:** 404 on non-existing proposals ([c87e7aa](https://github.com/zazuko/ontology-manager/commit/c87e7aa))



<a name="0.9.81"></a>
## 0.9.81 (2019-11-18)


### Bug Fixes

* **admin:** fix [#65](https://github.com/zazuko/ontology-manager/issues/65) - default filter to open proposals ([37abdb3](https://github.com/zazuko/ontology-manager/commit/37abdb3))
* **api:** remove pm2 ([3ab838b](https://github.com/zazuko/ontology-manager/commit/3ab838b))
* **assets:** losslessly optimize assets ([8491b0a](https://github.com/zazuko/ontology-manager/commit/8491b0a))
* **config:** releases published to sentry only when DSN provided ([e3e776d](https://github.com/zazuko/ontology-manager/commit/e3e776d))
* **design:** add product name in header ([7b75833](https://github.com/zazuko/ontology-manager/commit/7b75833))
* **design:** add zazuko ci layouts ([4fa1119](https://github.com/zazuko/ontology-manager/commit/4fa1119))
* **design:** avoid extending .button ([f611706](https://github.com/zazuko/ontology-manager/commit/f611706))
* **design:** make zazuko CI design default ([a49aca5](https://github.com/zazuko/ontology-manager/commit/a49aca5))
* **design:** update markup for button elements ([35a6930](https://github.com/zazuko/ontology-manager/commit/35a6930))
* **design:** use existing configurable values ([f537cae](https://github.com/zazuko/ontology-manager/commit/f537cae))
* **design:** zazuko: home tiles have max width in their container ([5a046a4](https://github.com/zazuko/ontology-manager/commit/5a046a4))
* **discussions:** answers should be shown once ([91e6bb9](https://github.com/zazuko/ontology-manager/commit/91e6bb9))
* **docker:** fix build script path ([ac3287b](https://github.com/zazuko/ontology-manager/commit/ac3287b))
* **forms:** progression is sticky ([2e2feb9](https://github.com/zazuko/ontology-manager/commit/2e2feb9))
* **gh-api:** cache last-modified when it actually changes ([87bfe87](https://github.com/zazuko/ontology-manager/commit/87bfe87))
* **graphile:** only log queries when asked explicitely ([09432f4](https://github.com/zazuko/ontology-manager/commit/09432f4))
* **hats:** granting via upsert works ([8c64aa5](https://github.com/zazuko/ontology-manager/commit/8c64aa5))
* **ie11:** use readonly instead of disabled for form fields ([73d183b](https://github.com/zazuko/ontology-manager/commit/73d183b))
* **k8s:** run migration on start, not as job ([de67cb7](https://github.com/zazuko/ontology-manager/commit/de67cb7))
* **markdown:** marked is a dep, not devdep ([f725e35](https://github.com/zazuko/ontology-manager/commit/f725e35))
* **markdown:** tiptap is available at runtime ([a7f640b](https://github.com/zazuko/ontology-manager/commit/a7f640b))
* **migrations:** check and mark trx success in same trx as migration ([51571ee](https://github.com/zazuko/ontology-manager/commit/51571ee))
* **migrations:** migration table has default vals for timestamps ([778ba3f](https://github.com/zazuko/ontology-manager/commit/778ba3f))
* **object-details:** render long description md to HTML ([21207c9](https://github.com/zazuko/ontology-manager/commit/21207c9))
* **proposals:** discriminate display on proposal type ([e9a60a5](https://github.com/zazuko/ontology-manager/commit/e9a60a5))
* **sentry:** add client sourcemaps ([9812434](https://github.com/zazuko/ontology-manager/commit/9812434))
* **setup:** [#71](https://github.com/zazuko/ontology-manager/issues/71) - install redirects to correct protocol ([e5ed9b2](https://github.com/zazuko/ontology-manager/commit/e5ed9b2))
* **structure:** nested containers don't keep adding trailing / ([833184b](https://github.com/zazuko/ontology-manager/commit/833184b))
* admin proposal list default sort is updated_at_desc ([fa68eed](https://github.com/zazuko/ontology-manager/commit/fa68eed))
* backend polls datasets ([7e0559f](https://github.com/zazuko/ontology-manager/commit/7e0559f))
* better fallback handling ([f140617](https://github.com/zazuko/ontology-manager/commit/f140617))
* default admin proposal list sorted by updatedAt desc ([5634c7a](https://github.com/zazuko/ontology-manager/commit/5634c7a))
* do not poll datasets server-side ([4e41599](https://github.com/zazuko/ontology-manager/commit/4e41599))
* downgrade nuxt auth ([e66a1f4](https://github.com/zazuko/ontology-manager/commit/e66a1f4))
* feeds should load a new page ([b0c4d7a](https://github.com/zazuko/ontology-manager/commit/b0c4d7a))
* fix activity list limit ([626a824](https://github.com/zazuko/ontology-manager/commit/626a824))
* load discussion reply box when logged in ([c941d85](https://github.com/zazuko/ontology-manager/commit/c941d85))
* make icons configurable by design ([c0771ee](https://github.com/zazuko/ontology-manager/commit/c0771ee))
* new class cannot show up on property proposals ([448d36d](https://github.com/zazuko/ontology-manager/commit/448d36d))
* **admin:** fix lists pagination ([094a109](https://github.com/zazuko/ontology-manager/commit/094a109))
* **admin:** make admin wait until their api actions complete ([f7ad46b](https://github.com/zazuko/ontology-manager/commit/f7ad46b))
* **admin:** proposal list works with null externalId ([5d85593](https://github.com/zazuko/ontology-manager/commit/5d85593))
* **admin:** smarter pagination ([6d14910](https://github.com/zazuko/ontology-manager/commit/6d14910))
* **api:** add debugging for getFile ([27c3ae8](https://github.com/zazuko/ontology-manager/commit/27c3ae8))
* **api:** admin api actions show helpful errors ([dba9b73](https://github.com/zazuko/ontology-manager/commit/dba9b73))
* **api:** debug logs for github API ([bd6989b](https://github.com/zazuko/ontology-manager/commit/bd6989b))
* **api:** enable octokit debug based on 'debug' ([44fa97b](https://github.com/zazuko/ontology-manager/commit/44fa97b))
* **api:** error.code deprecated in favor of error.status ([ecaa716](https://github.com/zazuko/ontology-manager/commit/ecaa716))
* **api:** fix github token auth ([218ca09](https://github.com/zazuko/ontology-manager/commit/218ca09))
* **dataset:** back to rdf-ext now that it uses rdf-dataset-indexed ([cfe1fd1](https://github.com/zazuko/ontology-manager/commit/cfe1fd1))
* **dataset-fetch:** do not raise unhandled exceptions ([7594174](https://github.com/zazuko/ontology-manager/commit/7594174))
* **deploy:** eslint-loader is a build dependency ([7e2ee3a](https://github.com/zazuko/ontology-manager/commit/7e2ee3a))
* **deploy:** reduce max mem restart ([2e24e05](https://github.com/zazuko/ontology-manager/commit/2e24e05))
* **deploy:** reduce unnecessary entrypoint delay ([066911b](https://github.com/zazuko/ontology-manager/commit/066911b))
* **deploy:** rotate and compress pm2 logs ([402d21f](https://github.com/zazuko/ontology-manager/commit/402d21f))
* **design:** Fix conversation top margin ([7872aa5](https://github.com/zazuko/ontology-manager/commit/7872aa5))
* **design:** form styling ([28c27b6](https://github.com/zazuko/ontology-manager/commit/28c27b6))
* **drafts:** draft author can discard their draft as normal user ([18df8d8](https://github.com/zazuko/ontology-manager/commit/18df8d8))
* **fallback:** wait for termIRI before deciding on the layout ([c16e17b](https://github.com/zazuko/ontology-manager/commit/c16e17b))
* **graphile:** account for longer startup time in dev env ([c5146ee](https://github.com/zazuko/ontology-manager/commit/c5146ee))
* **logging:** better scope for env-init ([f6a47e8](https://github.com/zazuko/ontology-manager/commit/f6a47e8))
* **proposal:** add visual cues to motivation fields ([d85d1f3](https://github.com/zazuko/ontology-manager/commit/d85d1f3))
* adapt max memory restart ([f8075b8](https://github.com/zazuko/ontology-manager/commit/f8075b8))
* add exponential backoff restart delay for prod ([e0b8639](https://github.com/zazuko/ontology-manager/commit/e0b8639))
* add healthcheck module folder ([f7a870a](https://github.com/zazuko/ontology-manager/commit/f7a870a))
* add zazuko logo ([030f156](https://github.com/zazuko/ontology-manager/commit/030f156))
* avoid potential security flaw ([90a6dac](https://github.com/zazuko/ontology-manager/commit/90a6dac))
* better error logging on entrypoint ([9898977](https://github.com/zazuko/ontology-manager/commit/9898977))
* better trifid fetch dataset logging ([5ddeedc](https://github.com/zazuko/ontology-manager/commit/5ddeedc))
* clear cookies on sign out ([f7f3858](https://github.com/zazuko/ontology-manager/commit/f7f3858)), closes [#27](https://github.com/zazuko/ontology-manager/issues/27)
* config and test fixes ([8830158](https://github.com/zazuko/ontology-manager/commit/8830158))
* dataset autoreload with github api conditional request ([e056ca3](https://github.com/zazuko/ontology-manager/commit/e056ca3))
* github api branch ref ([db2a7c6](https://github.com/zazuko/ontology-manager/commit/db2a7c6))
* github oauth works without prefix ([208862b](https://github.com/zazuko/ontology-manager/commit/208862b))
* gitlab builds still need the env [#50](https://github.com/zazuko/ontology-manager/issues/50) ([7530577](https://github.com/zazuko/ontology-manager/commit/7530577))
* initialize YATE once the textarea is ready ([251368b](https://github.com/zazuko/ontology-manager/commit/251368b))
* only update store when new dataset comes in ([bec8266](https://github.com/zazuko/ontology-manager/commit/bec8266))
* property list label from object ([efed2e4](https://github.com/zazuko/ontology-manager/commit/efed2e4))
* proposalCount only polled client-side; fix debug calls ([1227d46](https://github.com/zazuko/ontology-manager/commit/1227d46))
* **proposal:** quit loading screen when sending proposal fails ([ca2d7b7](https://github.com/zazuko/ontology-manager/commit/ca2d7b7))
* **proposal:** show toast error for proposal submit failures ([ea58c19](https://github.com/zazuko/ontology-manager/commit/ea58c19))
* **sentry:** always initialize sentry ([53228b0](https://github.com/zazuko/ontology-manager/commit/53228b0))
* **structure:** recursively count proposals count down structure tree ([5f13d24](https://github.com/zazuko/ontology-manager/commit/5f13d24))
* **structure:** show proposal count for classes ([c1536b2](https://github.com/zazuko/ontology-manager/commit/c1536b2))
* clear cookies to avoid setup stale state ([647636d](https://github.com/zazuko/ontology-manager/commit/647636d))
* gitlab builds still need the env [#50](https://github.com/zazuko/ontology-manager/issues/50) ([93bc99f](https://github.com/zazuko/ontology-manager/commit/93bc99f))
* improve prefixes handling ([e3206c7](https://github.com/zazuko/ontology-manager/commit/e3206c7))
* nginx and deploy fixes ([0308513](https://github.com/zazuko/ontology-manager/commit/0308513))
* nuxt.config should get variable replace at startup ([610dd7a](https://github.com/zazuko/ontology-manager/commit/610dd7a))
* SSR accesses computed instead of plugin ([ac7a98e](https://github.com/zazuko/ontology-manager/commit/ac7a98e))
* use custom server error page to clear cookies and reload ([ba9ac8b](https://github.com/zazuko/ontology-manager/commit/ba9ac8b))
* webpack can find [@babel](https://github.com/babel)/core ([238138b](https://github.com/zazuko/ontology-manager/commit/238138b))
* **config:** better cache invalidation ([a15e0ac](https://github.com/zazuko/ontology-manager/commit/a15e0ac))
* **config:** oauth is not configurable at runtime [#35](https://github.com/zazuko/ontology-manager/issues/35) ([250d903](https://github.com/zazuko/ontology-manager/commit/250d903))
* **config:** safer import from env vars ([c84fea8](https://github.com/zazuko/ontology-manager/commit/c84fea8))
* **deploy:** scale down ([200fe22](https://github.com/zazuko/ontology-manager/commit/200fe22))
* **design:** fix editor css rules ([2ce62e2](https://github.com/zazuko/ontology-manager/commit/2ce62e2))
* **ld+json:** build only the necessary resource graph instead of the whole ontology graph ([b627807](https://github.com/zazuko/ontology-manager/commit/b627807))
* **ld+json:** reenable jsonld now that dataset perfs are good enough ([5e862f7](https://github.com/zazuko/ontology-manager/commit/5e862f7))
* **pages:** remove test page ([30682c9](https://github.com/zazuko/ontology-manager/commit/30682c9))
* **proposal:** Replace cancel with discard ([30b1941](https://github.com/zazuko/ontology-manager/commit/30b1941))
* **proposal-design:** Fix tables and subform bottom margin ([d3dca5c](https://github.com/zazuko/ontology-manager/commit/d3dca5c))
* **proposal/_id:** display changed instead of new for change requests ([5a77dd1](https://github.com/zazuko/ontology-manager/commit/5a77dd1))
* **search:** clicking on result changes path before hiding ([28bced4](https://github.com/zazuko/ontology-manager/commit/28bced4))
* **topnav:** redesign draft counter ([0b4d99c](https://github.com/zazuko/ontology-manager/commit/0b4d99c))
* **trifid:** do not call replace on nullable ([e8bc0bd](https://github.com/zazuko/ontology-manager/commit/e8bc0bd))
* **trifid:** do not call replace on nullable ([a406e4a](https://github.com/zazuko/ontology-manager/commit/a406e4a))
* **ui:** use term(iri) instead of labels ([f5d7272](https://github.com/zazuko/ontology-manager/commit/f5d7272))
* **ux:** clarify some proposal forms labels ([ef61037](https://github.com/zazuko/ontology-manager/commit/ef61037))
* add dcf text to frontpage ([e54e0f9](https://github.com/zazuko/ontology-manager/commit/e54e0f9))
* admin proposal list does not filter hidden proposals ([c8e7e11](https://github.com/zazuko/ontology-manager/commit/c8e7e11))
* auth is marked as done when already auth'd ([34b0058](https://github.com/zazuko/ontology-manager/commit/34b0058))
* avoid firing gql queries from components before auth completes ([656d787](https://github.com/zazuko/ontology-manager/commit/656d787))
* breadcrumb handles classes out of structure tree ([eb53708](https://github.com/zazuko/ontology-manager/commit/eb53708))
* classes count is displayed on structure component ([23bdbed](https://github.com/zazuko/ontology-manager/commit/23bdbed))
* conditionnally render pouchbox ([ca05483](https://github.com/zazuko/ontology-manager/commit/ca05483))
* deploy process with timeout for healthchecks ([9e0ab05](https://github.com/zazuko/ontology-manager/commit/9e0ab05))
* disable graphiql in prod ([f17f0c6](https://github.com/zazuko/ontology-manager/commit/f17f0c6))
* first page has offset zero ([6659fb9](https://github.com/zazuko/ontology-manager/commit/6659fb9))
* hide admin link to non-admin users ([924419e](https://github.com/zazuko/ontology-manager/commit/924419e))
* hide admin link to non-admin users ([d585cd0](https://github.com/zazuko/ontology-manager/commit/d585cd0))
* load proposal on page load ([ee59f62](https://github.com/zazuko/ontology-manager/commit/ee59f62))
* make search stricter, less fuzzy ([83ffd7c](https://github.com/zazuko/ontology-manager/commit/83ffd7c))
* never iterate over undefined children ([5f3be8f](https://github.com/zazuko/ontology-manager/commit/5f3be8f))
* object lists media queries 12/6/3 ([e7b9b76](https://github.com/zazuko/ontology-manager/commit/e7b9b76))
* object tiles should never grow fullwidth ([0bbddc5](https://github.com/zazuko/ontology-manager/commit/0bbddc5))
* only top-level classes end up in structure ([e0f8fed](https://github.com/zazuko/ontology-manager/commit/e0f8fed))
* polling queries disabled server-side ([6089736](https://github.com/zazuko/ontology-manager/commit/6089736))
* proposal errors display in a modal ([8f53b25](https://github.com/zazuko/ontology-manager/commit/8f53b25))
* proposal pouch boxes behave like pouch boxes ([b217f14](https://github.com/zazuko/ontology-manager/commit/b217f14))
* search clears ([ee16cca](https://github.com/zazuko/ontology-manager/commit/ee16cca))
* show examples from ontology ([978e8e3](https://github.com/zazuko/ontology-manager/commit/978e8e3))


### Features

* entrypoint choses from built designs ([19fb293](https://github.com/zazuko/ontology-manager/commit/19fb293))
* **design:** first zazuko design steps ([34ba9d7](https://github.com/zazuko/ontology-manager/commit/34ba9d7))
* **design:** update images link ([3d70441](https://github.com/zazuko/ontology-manager/commit/3d70441))
* **design:** update pouches icons ([73370c3](https://github.com/zazuko/ontology-manager/commit/73370c3))
* **design:** zazuko ci design base ([b500631](https://github.com/zazuko/ontology-manager/commit/b500631))
* **design:** zazuko design ([7104dcd](https://github.com/zazuko/ontology-manager/commit/7104dcd))
* add CLA ([a397c75](https://github.com/zazuko/ontology-manager/commit/a397c75))
* add healthcheck endpoint ([a2f5d05](https://github.com/zazuko/ontology-manager/commit/a2f5d05))
* add proposal count to pouch boxes ([9457fc2](https://github.com/zazuko/ontology-manager/commit/9457fc2))
* add support and sample gh issue templates ([266e366](https://github.com/zazuko/ontology-manager/commit/266e366))
* add syndication feeds to footer ([d1bb64b](https://github.com/zazuko/ontology-manager/commit/d1bb64b))
* configurable design ([5b0b5b0](https://github.com/zazuko/ontology-manager/commit/5b0b5b0))
* initial editor setup ([1acc9a5](https://github.com/zazuko/ontology-manager/commit/1acc9a5))
* prop proposals show their sameAs ([6f06bfc](https://github.com/zazuko/ontology-manager/commit/6f06bfc))
* proposals have a 'back' path ([f501262](https://github.com/zazuko/ontology-manager/commit/f501262))
* remove PRs ([bd051d8](https://github.com/zazuko/ontology-manager/commit/bd051d8))
* **config:** add superadmin and config table ([ef6f219](https://github.com/zazuko/ontology-manager/commit/ef6f219))
* **config:** admin can set github params ([b8f616b](https://github.com/zazuko/ontology-manager/commit/b8f616b))
* **config:** admin settings page ([be6101b](https://github.com/zazuko/ontology-manager/commit/be6101b))
* **config:** async config and config store ([251e0ea](https://github.com/zazuko/ontology-manager/commit/251e0ea))
* **config:** automatically migrate env vars to database ([339d258](https://github.com/zazuko/ontology-manager/commit/339d258))
* **config:** configurable group names ([60acab2](https://github.com/zazuko/ontology-manager/commit/60acab2))
* **config:** fetch api config from db ([1c5b21a](https://github.com/zazuko/ontology-manager/commit/1c5b21a))
* **config:** libs are configured using store values ([8097185](https://github.com/zazuko/ontology-manager/commit/8097185))
* **config:** no env var clientside ([fbe7ae3](https://github.com/zazuko/ontology-manager/commit/fbe7ae3))
* **config:** reload middlewares ([c59a880](https://github.com/zazuko/ontology-manager/commit/c59a880))
* **config:** reload middlewares through SIGHUP ([49c4856](https://github.com/zazuko/ontology-manager/commit/49c4856))
* **config:** store is configured client- server-side ([b877a62](https://github.com/zazuko/ontology-manager/commit/b877a62))
* **proposals:** add sameAs support ([238e475](https://github.com/zazuko/ontology-manager/commit/238e475))
* **proposals:** add turtle editor to write examples ([ccd1673](https://github.com/zazuko/ontology-manager/commit/ccd1673))
* **rdf:** display class-like and property-like resources ([747b883](https://github.com/zazuko/ontology-manager/commit/747b883))
* display editor version in about page ([861bd98](https://github.com/zazuko/ontology-manager/commit/861bd98))
* explicit draft saves; discard; cancel; better autosave handling ([9adfe5c](https://github.com/zazuko/ontology-manager/commit/9adfe5c))
* get releases into sentry ([a280237](https://github.com/zazuko/ontology-manager/commit/a280237))
* include jsonld in meta ([14f7cdf](https://github.com/zazuko/ontology-manager/commit/14f7cdf))
* parallel deploy ([e4e096a](https://github.com/zazuko/ontology-manager/commit/e4e096a))
* pm2 cluster ([002e36b](https://github.com/zazuko/ontology-manager/commit/002e36b))
* proposal worklist: status filtering ([5f78023](https://github.com/zazuko/ontology-manager/commit/5f78023))
* rework deployment, serve static assets with nginx ([9cf1710](https://github.com/zazuko/ontology-manager/commit/9cf1710))
* serve ontology as resource ([1952d00](https://github.com/zazuko/ontology-manager/commit/1952d00))
* show property change proposals on property object details ([ca59482](https://github.com/zazuko/ontology-manager/commit/ca59482))
* **config:** saving config to db ([48c8a46](https://github.com/zazuko/ontology-manager/commit/48c8a46))
* **trifid:** only reload trifid when needed ([f65531d](https://github.com/zazuko/ontology-manager/commit/f65531d))
* user can re-add removed props; visual cues for new props and removed props ([a1c4e92](https://github.com/zazuko/ontology-manager/commit/a1c4e92))



<a name="0.9.80"></a>
## [0.9.80](https://github.com/zazuko/ontology-manager/compare/v0.9.79...v0.9.80) (2019-10-24)


### Bug Fixes

* **setup:** [#71](https://github.com/zazuko/ontology-manager/issues/71) - install redirects to correct protocol



<a name="0.9.79"></a>
## [0.9.79](https://github.com/zazuko/ontology-manager/compare/v0.9.78...v0.9.79) (2019-10-24)



<a name="0.9.78"></a>
## [0.9.78](https://github.com/zazuko/ontology-manager/compare/v0.9.77...v0.9.78) (2019-10-22)


### Bug Fixes

* **design:** zazuko: home tiles have max width in their container



<a name="0.9.77"></a>
## [0.9.77](https://github.com/zazuko/ontology-manager/compare/v0.9.76...v0.9.77) (2019-10-22)


### Bug Fixes

* **docker:** fix build script path



<a name="0.9.76"></a>
## [0.9.76](https://github.com/zazuko/ontology-manager/compare/v0.9.75...v0.9.76) (2019-10-22)


### Features

* entrypoint choses from built designs



<a name="0.9.72"></a>
## [0.9.72](https://github.com/zazuko/ontology-manager/compare/v0.9.71...v0.9.72) (2019-10-21)


### Bug Fixes

* **api:** remove pm2
* **design:** add zazuko ci layouts
* **design:** make zazuko CI design default
* **forms:** progression is sticky


### Features

* **design:** first zazuko design steps
* **design:** zazuko ci design base
* **design:** zazuko design



<a name="0.9.70"></a>
## [0.9.70](https://github.com/zazuko/ontology-manager/compare/v0.9.69...v0.9.70) (2019-08-21)


### Bug Fixes

* **hats:** granting via upsert works



<a name="0.9.69"></a>
## [0.9.69](https://github.com/zazuko/ontology-manager/compare/v0.9.68...v0.9.69) (2019-07-28)


### Bug Fixes

* **markdown:** tiptap is available at runtime
* **sentry:** add client sourcemaps



<a name="0.9.68"></a>
## [0.9.68](https://github.com/zazuko/ontology-manager/compare/v0.9.67...v0.9.68) (2019-07-28)


### Bug Fixes

* **markdown:** marked is a dep, not devdep



<a name="0.9.66"></a>
## [0.9.66](https://github.com/zazuko/ontology-manager/compare/v0.9.65...v0.9.66) (2019-07-28)


### Bug Fixes

* **discussions:** answers should be shown once
* **swiss-ci:** revert discussion title margin



<a name="0.9.65"></a>
## [0.9.65](https://github.com/zazuko/ontology-manager/compare/v0.9.64...v0.9.65) (2019-07-28)


### Bug Fixes

* load discussion reply box when logged in



<a name="0.9.64"></a>
## [0.9.64](https://github.com/zazuko/ontology-manager/compare/v0.9.63...v0.9.64) (2019-07-26)


### Bug Fixes

* backend polls datasets



<a name="0.9.63"></a>
## [0.9.63](https://github.com/zazuko/ontology-manager/compare/v0.9.62...v0.9.63) (2019-07-26)


### Bug Fixes

* align title icons
* better fallback handling
* feeds should load a new page
* **migrations:** migration table has default vals for timestamps



<a name="0.9.62"></a>
## [0.9.62](https://github.com/zazuko/ontology-manager/compare/v0.9.61...v0.9.62) (2019-07-23)


### Bug Fixes

* **admin:** fix [#65](https://github.com/zazuko/ontology-manager/issues/65) - default filter to open proposals
* **k8s:** run migration on start, not as job
* **migrations:** check and mark trx success in same trx as migration



<a name="0.9.61"></a>
## [0.9.61](https://github.com/zazuko/ontology-manager/compare/v0.9.60...v0.9.61) (2019-07-18)


### Bug Fixes

* new class cannot show up on property proposals



<a name="0.9.60"></a>
## [0.9.60](https://github.com/zazuko/ontology-manager/compare/v0.9.59...v0.9.60) (2019-07-15)


### Bug Fixes

* **ie11:** use readonly instead of disabled for form fields
* **proposals:** discriminate display on proposal type



<a name="0.9.59"></a>
## [0.9.59](https://github.com/zazuko/ontology-manager/compare/v0.9.58...v0.9.59) (2019-07-04)


### Bug Fixes

* make icons configurable by design
* **assets:** losslessly optimize assets
* **design:** add product name in header
* **design:** avoid extending .button
* **design:** fix responsiveness for header and footer
* **design:** fix some gliches in activity component
* **design:** fix some gliches in navbar component
* **design:** hide editor title from navbar
* **design:** pouch and class images are red
* **design:** update admin pages styles
* **design:** update discussion component style
* **design:** update layout-objects-details style
* **design:** update layout-objects-list
* **design:** update markup for button elements
* **design:** update modal components style
* **design:** update new thread style
* **design:** update proposal layout and components style
* **design:** use existing configurable values
* **scss:** extending .button takes too long


### Features

* **design:** add correct fonts
* **design:** add resource from swiss guidelines
* **design:** create new swiss layout
* **design:** update footer style
* **design:** update generic CSS variables
* **design:** update global layout
* **design:** update images link
* **design:** update pouches icons
* **design:** update topbar design



<a name="0.9.58"></a>
## [0.9.58](https://github.com/zazuko/ontology-manager/compare/v0.9.57...v0.9.58) (2019-06-29)


### Bug Fixes

* downgrade nuxt auth



<a name="0.9.57"></a>
## [0.9.57](https://github.com/zazuko/ontology-manager/compare/v0.9.56...v0.9.57) (2019-06-29)


### Bug Fixes

* do not poll datasets server-side
* **dataset-fetch:** do not raise unhandled exceptions
* **logging:** better scope for env-init



<a name="0.9.56"></a>
## [0.9.56](https://github.com/zazuko/ontology-manager/compare/v0.9.55...v0.9.56) (2019-06-24)


### Bug Fixes

* **api:** add debugging for getFile
* **proposal:** add visual cues to motivation fields



<a name="0.9.54"></a>
## [0.9.54](https://github.com/zazuko/ontology-manager/compare/v0.9.53...v0.9.54) (2019-06-17)


### Bug Fixes

* better trifid fetch dataset logging



<a name="0.9.51"></a>
## [0.9.51](https://github.com/zazuko/ontology-manager/compare/v0.9.50...v0.9.51) (2019-06-06)


### Bug Fixes

* adapt max memory restart



<a name="0.9.50"></a>
## [0.9.50](https://github.com/zazuko/ontology-manager/compare/v0.9.49...v0.9.50) (2019-06-06)


### Features

Designs can be configured at runtime using the `EDITOR_STYLE` env var.
[How to create a design](https://github.com/zazuko/ontology-manager/commit/1119631d2a0457fbf3f71b5e03a2d187e4fcffb8?short_path=04c6e90).

* configurable design



<a name="0.9.49"></a>
## [0.9.49](https://github.com/zazuko/ontology-manager/compare/v0.9.48...v0.9.49) (2019-06-05)


### Bug Fixes

* add healthcheck module folder



<a name="0.9.48"></a>
## [0.9.48](https://github.com/zazuko/ontology-manager/compare/v0.9.47...v0.9.48) (2019-06-05)


### Features

Healthcheck endpoint: `/api/health` returns http200 with `ok` as plain/text.

* add healthcheck endpoint



<a name="0.9.46"></a>
## [0.9.46](https://github.com/zazuko/ontology-manager/compare/v0.9.45...v0.9.46) (2019-06-03)


### Bug Fixes

* github api branch ref



<a name="0.9.45"></a>
## [0.9.45](https://github.com/zazuko/ontology-manager/compare/v0.9.44...v0.9.45) (2019-05-27)


### Bug Fixes

* **deploy:** eslint-loader is a build dependency



<a name="0.9.44"></a>
## [0.9.44](https://github.com/zazuko/ontology-manager/compare/v0.9.37...v0.9.44) (2019-05-27)


### Bug Fixes

PM2 rotates and compresses its logs to spare container disk usage.

* proposalCount only polled client-side; fix debug calls
* **deploy:** rotate and compress pm2 logs



<a name="0.9.37"></a>
## [0.9.37](https://github.com/zazuko/ontology-manager/compare/v0.9.36...v0.9.37) (2019-05-20)


### Bug Fixes

* **design:** form styling



<a name="0.9.36"></a>
## [0.9.36](https://github.com/zazuko/ontology-manager/compare/v0.9.35...v0.9.36) (2019-05-20)


### Bug Fixes

Admin pagination is much nicer.

* **admin:** smarter pagination



<a name="0.9.35"></a>
## [0.9.35](https://github.com/zazuko/ontology-manager/compare/v0.9.34...v0.9.35) (2019-05-15)


### Bug Fixes

* **admin:** fix lists pagination



<a name="0.9.33"></a>
## [0.9.33](https://github.com/zazuko/ontology-manager/compare/v0.9.32...v0.9.33) (2019-05-14)


### Bug Fixes

* only update store when new dataset comes in
* **structure:** recursively count proposals count down structure tree  
Proposal count displayed on the structure is counting recursively to prevent a parent with 0 proposal
to show 0 when its children have proposals.

<a name="0.9.31"></a>
## [0.9.31](https://github.com/zazuko/ontology-manager/compare/v0.9.30...v0.9.31) (2019-05-13)


### Bug Fixes

* **structure:** show proposal count for classes



<a name="0.9.30"></a>
## [0.9.30](https://github.com/zazuko/ontology-manager/compare/v0.9.29...v0.9.30) (2019-05-13)


### Bug Fixes

* polling queries disabled server-side
* **admin:** proposal list works with null externalId



<a name="0.9.29"></a>
## [0.9.29](https://github.com/zazuko/ontology-manager/compare/v0.9.28...v0.9.29) (2019-05-01)


### Bug Fixes

* gitlab builds still need the env [#50](https://github.com/zazuko/ontology-manager/issues/50)



<a name="0.9.28"></a>
## [0.9.28](https://github.com/zazuko/ontology-manager/compare/v0.9.27...v0.9.28) (2019-05-01)


### Bug Fixes

* gitlab builds still need the env [#50](https://github.com/zazuko/ontology-manager/issues/50)



<a name="0.9.27"></a>
## [0.9.27](https://github.com/zazuko/ontology-manager/compare/v0.9.26...v0.9.27) (2019-05-01)


### Features

* remove PRs



<a name="0.9.26"></a>
## [0.9.26](https://github.com/zazuko/ontology-manager/compare/v0.9.25...v0.9.26) (2019-04-29)


### Features

* add proposal count to pouch boxes
* prop proposals show their sameAs
* proposals have a 'back' path



<a name="0.9.25"></a>
## [0.9.25](https://github.com/zazuko/ontology-manager/compare/v0.9.24...v0.9.25) (2019-04-24)


### Features

* add support and sample gh issue templates



<a name="0.9.24"></a>
## [0.9.24](https://github.com/zazuko/ontology-manager/compare/v0.9.23...v0.9.24) (2019-04-24)


### Bug Fixes

* **deploy:** reduce max mem restart



<a name="0.9.23"></a>
## [0.9.23](https://github.com/zazuko/ontology-manager/compare/v0.9.22...v0.9.23) (2019-04-24)


### Bug Fixes

* **graphile:** account for longer startup time in dev env


### Features

* add CLA



<a name="0.9.22"></a>
## [0.9.22](https://github.com/zazuko/ontology-manager/compare/v0.9.21...v0.9.22) (2019-04-23)


### Bug Fixes

* **api:** enable octokit debug based on 'debug'



<a name="0.9.21"></a>
## [0.9.21](https://github.com/zazuko/ontology-manager/compare/v0.9.20...v0.9.21) (2019-04-23)


### Bug Fixes

* **proposal:** show toast error for proposal submit failures



<a name="0.9.20"></a>
## [0.9.20](https://github.com/zazuko/ontology-manager/compare/v0.9.19...v0.9.20) (2019-04-23)


### Bug Fixes

* **proposal:** quit loading screen when sending proposal fails



<a name="0.9.19"></a>
## [0.9.19](https://github.com/zazuko/ontology-manager/compare/v0.9.18...v0.9.19) (2019-04-23)


### Bug Fixes

* **api:** debug logs for github API



<a name="0.9.18"></a>
## [0.9.18](https://github.com/zazuko/ontology-manager/compare/v0.9.17...v0.9.18) (2019-04-23)


### Bug Fixes

* **api:** error.code deprecated in favor of error.status
* **deploy:** reduce unnecessary entrypoint delay



<a name="0.9.17"></a>
## [0.9.17](https://github.com/zazuko/ontology-manager/compare/v0.9.16...v0.9.17) (2019-04-23)


### Bug Fixes

* admin proposal list default sort is updated_at_desc
* dataset autoreload with github api conditional request



<a name="0.9.16"></a>
## [0.9.16](https://github.com/zazuko/ontology-manager/compare/v0.9.15...v0.9.16) (2019-04-18)


### Bug Fixes

* default admin proposal list sorted by updatedAt desc



<a name="0.9.15"></a>
## [0.9.15](https://github.com/zazuko/ontology-manager/compare/v0.9.14...v0.9.15) (2019-04-18)


### Bug Fixes

* fix activity list limit


### Features

* add syndication feeds to footer



<a name="0.9.14"></a>
## [0.9.14](https://github.com/zazuko/ontology-manager/compare/v0.9.13...v0.9.14) (2019-04-18)


### Bug Fixes

* **design:** disabled subform fields shoud stand out
* initialize YATE once the textarea is ready
* property list label from object
* **fallback:** wait for termIRI before deciding on the layout



<a name="0.9.13"></a>
## [0.9.13](https://github.com/zazuko/ontology-manager/compare/v0.9.12...v0.9.13) (2019-04-18)


### Bug Fixes

* **drafts:** draft author can discard their draft as normal user
* **sentry:** always initialize sentry



<a name="0.9.12"></a>
## [0.9.12](https://github.com/zazuko/ontology-manager/compare/v0.9.11...v0.9.12) (2019-04-18)


### Bug Fixes

* SSR accesses computed instead of plugin



<a name="0.9.10"></a>
## [0.9.10](https://github.com/zazuko/ontology-manager/compare/v0.9.9...v0.9.10) (2019-04-15)


### Bug Fixes

* clear cookies to avoid setup stale state



<a name="0.9.9"></a>
## [0.9.9](https://github.com/zazuko/ontology-manager/compare/v0.9.2...v0.9.9) (2019-04-11)


### Bug Fixes

* add exponential backoff restart delay for prod
* better error logging on entrypoint
* github oauth works without prefix
* nginx and deploy fixes
* nuxt.config should get variable replace at startup



<a name="0.9.2"></a>
## [0.9.2](https://github.com/zazuko/ontology-manager/compare/v0.9.1...v0.9.2) (2019-04-08)


### Bug Fixes

* webpack can find [@babel](https://github.com/babel)/core



<a name="0.9.0"></a>
# [0.9.0](https://github.com/zazuko/ontology-manager/compare/v0.8.15...v0.9.0) (2019-04-01)


### Features

* **rdf:** display class-like and property-like resources



<a name="0.8.14"></a>
## [0.8.14](https://github.com/zazuko/ontology-manager/compare/v0.8.13...v0.8.14) (2019-03-27)


### Bug Fixes

* avoid potential security flaw


### Features

* initial editor setup



<a name="0.8.13"></a>
## [0.8.13](https://github.com/zazuko/ontology-manager/compare/v0.8.12...v0.8.13) (2019-03-20)


### Bug Fixes

* **ui:** use term(iri) instead of labels


### Features

* **config:** admin can set github params



<a name="0.8.12"></a>
## [0.8.12](https://github.com/zazuko/ontology-manager/compare/v0.8.11...v0.8.12) (2019-03-13)


### Bug Fixes

* **ux:** clarify some proposal forms labels



<a name="0.8.11"></a>
## [0.8.11](https://github.com/zazuko/ontology-manager/compare/v0.8.10...v0.8.11) (2019-03-12)


### Features

* **proposals:** add turtle editor to write examples



<a name="0.8.10"></a>
## [0.8.10](https://github.com/zazuko/ontology-manager/compare/v0.8.9...v0.8.10) (2019-03-11)


### Features

* **proposals:** add sameAs support



<a name="0.8.9"></a>
## [0.8.9](https://github.com/zazuko/ontology-manager/compare/v0.8.8...v0.8.9) (2019-03-11)


### Bug Fixes

* **pages:** remove test page



<a name="0.8.8"></a>
## [0.8.8](https://github.com/zazuko/ontology-manager/compare/v0.8.7...v0.8.8) (2019-03-04)


### Features

* show property change proposals on property object details



<a name="0.8.7"></a>
## [0.8.7](https://github.com/zazuko/ontology-manager/compare/v0.8.6...v0.8.7) (2019-03-04)


### Bug Fixes

* **config:** safer import from env vars



<a name="0.8.6"></a>
## [0.8.6](https://github.com/zazuko/ontology-manager/compare/v0.8.5...v0.8.6) (2019-03-04)


### Bug Fixes

* use custom server error page to clear cookies and reload


### Features

* **config:** reload middlewares through SIGHUP



<a name="0.8.5"></a>
## [0.8.5](https://github.com/zazuko/ontology-manager/compare/v0.8.4...v0.8.5) (2019-02-28)


### Bug Fixes

* improve prefixes handling



<a name="0.8.4"></a>
## [0.8.4](https://github.com/zazuko/ontology-manager/compare/v0.8.3...v0.8.4) (2019-02-27)


### Bug Fixes

* **trifid:** do not call replace on nullable



<a name="0.8.3"></a>
## [0.8.3](https://github.com/zazuko/ontology-manager/compare/v0.8.2...v0.8.3) (2019-02-27)


### Bug Fixes

* **trifid:** do not call replace on nullable



<a name="0.8.2"></a>
## [0.8.2](https://github.com/zazuko/ontology-manager/compare/v0.8.1...v0.8.2) (2019-02-27)


### Features

* serve ontology as resource



<a name="0.8.1"></a>
## [0.8.1](https://github.com/zazuko/ontology-manager/compare/v0.8.0...v0.8.1) (2019-02-26)


### Bug Fixes

* add zazuko logo
* **config:** better cache invalidation


### Features

* **config:** configurable group names



<a name="0.8.0"></a>
# [0.8.0](https://github.com/zazuko/ontology-manager/compare/v0.7.2...v0.8.0) (2019-02-26)


### Bug Fixes

* clear cookies on sign out, closes [#27](https://github.com/zazuko/ontology-manager/issues/27)
* **config:** oauth is not configurable at runtime [#35](https://github.com/zazuko/ontology-manager/issues/35)
* **deploy:** scale down


### Features

* **config:** add superadmin and config table
* **config:** admin settings page
* **config:** async config and config store
* **config:** automatically migrate env vars to database
* **config:** fetch api config from db
* **config:** libs are configured using store values
* **config:** no env var clientside
* **config:** reload middlewares
* **config:** saving config to db
* **config:** store is configured client- server-side
* **trifid:** only reload trifid when needed



<a name="0.7.2"></a>
## [0.7.2](https://github.com/zazuko/ontology-manager/compare/v0.7.1...v0.7.2) (2019-02-12)


### Bug Fixes

* **design:** fix editor css rules



<a name="0.7.1"></a>
## [0.7.1](https://github.com/zazuko/ontology-manager/compare/v0.7.0...v0.7.1) (2019-02-11)


### Bug Fixes

* config and test fixes


### Features

* include jsonld in meta
* pm2 cluster



<a name="0.7.0"></a>
# [0.7.0](https://github.com/zazuko/ontology-manager/compare/v0.6.49...v0.7.0) (2019-02-07)


### Features

* user can re-add removed props; visual cues for new props and removed props



<a name="0.6.49"></a>
## [0.6.49](https://github.com/zazuko/ontology-manager/compare/v0.6.48...v0.6.49) (2019-02-07)


### Bug Fixes

* **admin:** make admin wait until their api actions complete
* **api:** admin api actions show helpful errors
* **design:** Fix conversation top margin
* show examples from ontology



<a name="0.6.48"></a>
## [0.6.48](https://github.com/zazuko/ontology-manager/compare/v0.6.47...v0.6.48) (2019-02-05)


### Features

* get releases into sentry



<a name="0.6.47"></a>
## [0.6.47](https://github.com/zazuko/ontology-manager/compare/v0.6.46...v0.6.47) (2019-02-05)


### Bug Fixes

* **api:** fix github token auth



<a name="0.6.45"></a>
## [0.6.45](https://github.com/zazuko/ontology-manager/compare/v0.6.44...v0.6.45) (2019-02-04)


### Features

* rework deployment, serve static assets with nginx



<a name="0.6.44"></a>
## [0.6.44](https://github.com/zazuko/ontology-manager/compare/v0.6.43...v0.6.44) (2019-01-30)


### Bug Fixes

* **ld+json:** build only the necessary resource graph instead of the whole ontology graph



<a name="0.6.43"></a>
## [0.6.43](https://github.com/zazuko/ontology-manager/compare/v0.6.42...v0.6.43) (2019-01-29)


### Bug Fixes

* **ld+json:** reenable jsonld now that dataset perfs are good enough



<a name="0.6.42"></a>
## [0.6.42](https://github.com/zazuko/ontology-manager/compare/v0.6.41...v0.6.42) (2019-01-29)


### Bug Fixes

* **dataset:** back to rdf-ext now that it uses rdf-dataset-indexed



<a name="0.6.40"></a>
## [0.6.40](https://github.com/zazuko/ontology-manager/compare/v0.6.39...v0.6.40) (2019-01-25)


### Bug Fixes

* **search:** clicking on result changes path before hiding



<a name="0.6.39"></a>
## [0.6.39](https://github.com/zazuko/ontology-manager/compare/v0.6.38...v0.6.39) (2019-01-24)


### Bug Fixes

* **proposal:** Replace cancel with discard



<a name="0.6.37"></a>
## [0.6.37](https://github.com/zazuko/ontology-manager/compare/v0.6.36...v0.6.37) (2019-01-23)


### Bug Fixes

* **proposal-design:** Fix tables and subform bottom margin



<a name="0.6.36"></a>
## [0.6.36](https://github.com/zazuko/ontology-manager/compare/v0.6.35...v0.6.36) (2019-01-23)


### Features

* explicit draft saves; discard; cancel; better autosave handling



<a name="0.6.35"></a>
## [0.6.35](https://github.com/zazuko/ontology-manager/compare/v0.6.34...v0.6.35) (2019-01-22)


### Bug Fixes

* **proposal/_id:** display changed instead of new for change requests
* **topnav:** redesign draft counter



<a name="0.6.34"></a>
## [0.6.34](https://github.com/zazuko/ontology-manager/compare/v0.6.33...v0.6.34) (2019-01-22)


### Bug Fixes

* conditionnally render pouchbox



<a name="0.6.33"></a>
## [0.6.33](https://github.com/zazuko/ontology-manager/compare/v0.6.32...v0.6.33) (2019-01-22)


### Bug Fixes

* proposal pouch boxes behave like pouch boxes


### Features

* proposal worklist: status filtering



<a name="0.6.32"></a>
## [0.6.32](https://github.com/zazuko/ontology-manager/compare/v0.6.31...v0.6.32) (2019-01-21)


### Bug Fixes

* add dcf text to frontpage



<a name="0.6.31"></a>
## [0.6.31](https://github.com/zazuko/ontology-manager/compare/v0.6.30...v0.6.31) (2019-01-21)


### Bug Fixes

* classes count is displayed on structure component



<a name="0.6.30"></a>
## [0.6.30](https://github.com/zazuko/ontology-manager/compare/v0.6.29...v0.6.30) (2019-01-21)


### Bug Fixes

* make search stricter, less fuzzy
* never iterate over undefined children



<a name="0.6.29"></a>
## [0.6.29](https://github.com/zazuko/ontology-manager/compare/v0.6.28...v0.6.29) (2019-01-21)


### Bug Fixes

* hide admin link to non-admin users



<a name="0.6.28"></a>
## [0.6.28](https://github.com/zazuko/ontology-manager/compare/v0.6.27...v0.6.28) (2019-01-21)


### Bug Fixes

* hide admin link to non-admin users



<a name="0.6.27"></a>
## [0.6.27](https://github.com/zazuko/ontology-manager/compare/v0.6.26...v0.6.27) (2019-01-21)


### Bug Fixes

* object tiles should never grow fullwidth
* proposal errors display in a modal



<a name="0.6.26"></a>
## [0.6.26](https://github.com/zazuko/ontology-manager/compare/v0.6.25...v0.6.26) (2019-01-21)


### Bug Fixes

* object lists media queries 12/6/3
* only top-level classes end up in structure



<a name="0.6.25"></a>
## [0.6.25](https://github.com/zazuko/ontology-manager/compare/v0.6.24...v0.6.25) (2019-01-17)


### Bug Fixes

* first page has offset zero



<a name="0.6.24"></a>
## [0.6.24](https://github.com/zazuko/ontology-manager/compare/v0.6.23...v0.6.24) (2019-01-17)


### Bug Fixes

* admin proposal list does not filter hidden proposals
* breadcrumb handles classes out of structure tree
* disable graphiql in prod
* search clears



<a name="0.6.23"></a>
## [0.6.23](https://github.com/zazuko/ontology-manager/compare/v0.6.22...v0.6.23) (2019-01-17)


### Features

* parallel deploy



<a name="0.6.22"></a>
## [0.6.22](https://github.com/zazuko/ontology-manager/compare/v0.6.21...v0.6.22) (2019-01-17)


### Bug Fixes

* auth is marked as done when already auth'd



<a name="0.6.21"></a>
## [0.6.21](https://github.com/zazuko/ontology-manager/compare/v0.6.20...v0.6.21) (2019-01-17)


### Bug Fixes

* deploy process with timeout for healthchecks



<a name="0.6.20"></a>
## [0.6.20](https://github.com/zazuko/ontology-manager/compare/v0.6.19...v0.6.20) (2019-01-17)


### Features

* display editor version in about page



<a name="0.6.19"></a>
## [0.6.19](https://github.com/zazuko/ontology-manager/compare/v0.6.18...v0.6.19) (2019-01-17)


### Bug Fixes

* load proposal on page load



<a name="0.6.18"></a>
## [0.6.18](https://github.com/zazuko/ontology-manager/compare/v0.6.17...v0.6.18) (2019-01-17)


### Bug Fixes

* avoid firing gql queries from components before auth completes
* class subform should have white background
