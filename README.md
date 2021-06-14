# ✨ Build DotNet
📦 GitHub action to build, test, and package projects.

## Usage
Create new `.github/workflows/build.yml` file:

```yml
name: .NET Core Build
on:
  push:
    branches:
      - main # Default release branch
jobs:
  publish:
    name: build, pack & publish
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.5.9

      # - name: Setup dotnet
      #   uses: actions/setup-dotnet@v1
      #   with:
      #     dotnet-version: 3.1.200

      - name: Restore, Build, test, and pack
        uses: Elskom/build-dotnet@main
        with:
          SOLUTION_FILE_PATH: solution.sln
          PACKAGE_PATH: artifacts/
          TEST: true
```

Project gets built, optionally tested, and packaged (packaging is default enabled).

## Inputs

Input | Default Value | Description
--- | --- | ---
SOLUTION_FILE_PATH | | Filepath of the solution of which contains all the projects to be packed, relative to root of repository
PACKAGE_PATH | | Path to store all generated nuget packages, relative to root of repository
TEST | `false` | Flag to toggle running unit tests for the projects built, disabled by default
PACK | `true` | Flag to toggle packing the projects built, enabled by default

**FYI:**
- Unit testing code coverage would need to be set in the csproj or an ``Directory.Build.props`` file of the project that contains unit tests with these set:
  - ``<CollectCoverage>true</CollectCoverage>``
  - ``<CoverletOutputFormat>opencover</CoverletOutputFormat>`` (or any other output format required by the service where the coverage reports get reported to)
  - ``<CoverletOutput>$(MSBuildThisFileDirectory)</CoverletOutput>``
- When wanting to include symbols in an symbols package set these as well in the csproj or an ``Directory.Build.props`` file of the project:
  - ``<IncludeSymbols>true</IncludeSymbols>``
  - ``<SymbolPackageFormat>snupkg</SymbolPackageFormat>``
- When the project being built is set to generate package on build, the PACK option on this action must be disabled.

## License
[MIT](LICENSE)
