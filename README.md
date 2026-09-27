# bobbydreamer.xyz

This repository contains the source for [bobbydreamer.xyz](https://bobbydreamer.xyz),
the personal blog and digital garden of Sushanth (bobby_dreamer).

I am a mainframe Db2 DBA, and this site is my sandbox for notes about databases,
programming, site reliability engineering, home projects, investing, personal
development, and other things I learn along the way.

## Built with Quartz

The site uses the [Quartz](https://quartz.jzhao.xyz/) static-site template and is
currently based on Quartz 5. The template has been customized to preserve the
site's article chronology and URLs while adding its own navigation, archives,
topics, metadata, search, graph, and production publishing behavior.

Quartz is an open-source project created by Jacky Zhao and its contributors. See
the [upstream Quartz repository](https://github.com/jackyzha0/quartz) for the
original project, documentation, and license information.

## Local development

The project requires Node.js 22 or newer and npm 10.9.2 or newer.

```bash
npm ci
npm run serve
```

The local preview rebuilds as content changes. Blog content is stored in
[`content`](./content).

## Validation

Run the repository checks before publishing:

```bash
npm test
npm run check
npm run deploy:check
```

`deploy:check` performs the complete read-only production validation sequence,
including the generated-site, package, cache, Caddy, and migration checks.

## Publishing

Production publishing is intentionally an explicit operation:

```bash
npm run deploy:production
```

The deployment workflow builds and validates a replacement, switches production
only after it is healthy, performs post-deployment checks, and can restore the
previous working revision if verification fails. See
[`PRODUCTION.md`](./PRODUCTION.md) for the operational runbook.

## License

The Quartz framework remains subject to its upstream MIT license. Site content
and personal customizations are maintained in this repository by Sushanth.
