# PYP Global Search

Search across all [Pick Your Part (PYP)](https://www.pyp.com) salvage yard inventory locations nationwide.

## Features

- **Multi-location Search**: Search across all PYP locations simultaneously
- **Advanced Filtering**: Filter by make, color, year, state, and specific yards
- **Real-time Results**: Fast, concurrent searches with live result updates
- **Vehicle Details**: Complete vehicle information with images and direct links
- **Shareable URLs**: All filters and search state preserved in the URL

## Tech Stack

- [Next.js](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org) - Static type checking
- [Tailwind CSS](https://tailwindcss.com) - Utility-first styling
- [shadcn/ui](https://ui.shadcn.com) - Accessible UI components
- [tRPC](https://trpc.io) - End-to-end type-safe APIs
- [Cheerio](https://cheerio.js.org) - Server-side HTML parsing
- [nuqs](https://nuqs.47ng.com) - Type-safe URL search params

_This project was initially scaffolded using [create-t3-app](https://create.t3.gg/)._

## Getting Started

1. Clone the repository
2. Install dependencies: `bun install`
3. Run the development server: `bun dev`
4. Open [http://localhost:3000](http://localhost:3000)

## License

This project is open source and available under the [MIT License](LICENSE).

# TODO
- Make the header sticky
- Make the "save searches" have optimistic updates
- Combine the avatar and theme toggle into a single button
- Add the saved searches to the home page
- Add oauth login
- Add password reset