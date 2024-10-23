# Browser Based Offline Inference

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). You can use this code to run Conformer based ONNX models directly in the browser with no need for an internet connection.

## Getting Started

Install [Rust](https://www.rust-lang.org/tools/install) and [Wasm-Pack](https://rustwasm.github.io/wasm-pack/book/quickstart.html).

Clone the repository:
```bash
git clone --recurse-submodules https://github.com/AI4Bharat/offline-model-inference.git
```
 
First, build the Preprocessor:
```bash
npm run debug-build-rs # debug build, with better browser console error logging
# or
npm run release-build-rs # optimised build for production
```

Install all packages, including the newly built wasm package:
```bash
npm i
```

To run the development server:
```bash
npm run dev
```

To run the production server:
```bash
npm run build
npm start
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
