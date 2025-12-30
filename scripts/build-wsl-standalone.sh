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
schema_file="prisma/schema.prisma"
if [ ! -f "${schema_file}" ]; then
  echo "Missing ${schema_file}." >&2
  exit 1
fi

if ! grep -q 'binaryTargets' "${schema_file}" || \
   ! grep -q 'rhel-openssl-3.0.x' "${schema_file}" || \
   ! grep -q 'rhel-openssl-1.1.x' "${schema_file}"; then
  echo "schema.prisma must include binaryTargets = [\"native\", \"rhel-openssl-3.0.x\", \"rhel-openssl-1.1.x\"]." >&2
  exit 1
fi

npx prisma generate

echo "Building Next.js standalone..."
created_env_file=""
if [ ! -f ".env" ]; then
  : > .env
  created_env_file="true"
fi
npm run build
if [ -n "${created_env_file}" ]; then
  rm -f .env
fi

echo "Verifying Prisma Linux engine..."
engine_dir=".next/standalone/node_modules/.prisma/client"
if ! ls "${engine_dir}"/libquery_engine-rhel-openssl-*.so.node >/dev/null 2>&1; then
  echo "Missing RHEL Prisma engine. Build must run on WSL/Linux with RHEL targets." >&2
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

echo "Removing env files from deploy..."
find deploy -maxdepth 2 -type f -name ".env*" -delete

echo "Creating ZIP..."
cd deploy
zip -r ../deploy.zip .
cd ..

echo "Build complete. Upload deploy.zip to cPanel."
