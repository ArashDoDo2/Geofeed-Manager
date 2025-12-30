#!/bin/bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

cd "${repo_root}"

echo "Cleaning old build..."
rm -rf .next deploy deploy.zip node_modules

echo "Installing Linux node_modules..."
npm ci

echo "Generating Prisma Linux binaries..."
# Ensure prisma/schema.prisma has:
# binaryTargets = ["native", "linux-musl", "linux-x64"]
npx prisma generate

echo "Building Next.js standalone..."
npm run build

echo "Verifying Prisma Linux engine..."
if ! ls .next/standalone/node_modules/.prisma/client/query_engine-linux*.node >/dev/null 2>&1; then
  echo "Missing Linux Prisma engine. Build must run on WSL/Linux." >&2
  exit 1
fi

echo "Preparing deploy folder..."
mkdir -p deploy/.next
cp -r .next/standalone deploy/.next/
cp -r .next/static deploy/.next/
cp .next/BUILD_ID deploy/.next/

cp -r public deploy/public
cp -r prisma deploy/prisma
cp -r data deploy/data

cp package.json deploy/
cp server.js deploy/

echo "Removing Windows Prisma artifacts..."
find deploy -type f -name "*windows*.node" -delete
find deploy -type f -name "*.dll.node" -delete

echo "Creating ZIP..."
cd deploy
zip -r ../deploy.zip .
cd ..

echo "Build complete. Upload deploy.zip to cPanel."
