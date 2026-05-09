# Jekyll Setup

This site is built with Jekyll through the `github-pages` Ruby gem.

## Files to edit

- `_data/home.yml`: homepage content
- `assets/site.css`: page styling
- `assets/profile.jpg`: profile photo
- `assets/projects/`: publication/project images
- `index.html`: Jekyll template

## macOS / Linux prerequisites

Check Ruby:

```bash
ruby -v
```

This project currently works with the system Ruby on macOS because `Gemfile`
pins `ffi` to a Ruby 2.6-compatible version. On a new Linux machine, Ruby 3.x is
recommended.

Install Ruby and build tools on Ubuntu/Debian:

```bash
sudo apt update
sudo apt install ruby-full build-essential zlib1g-dev
```

Install Bundler:

```bash
gem install bundler
```

If `gem install` complains about permissions, use a user-local gem path:

```bash
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
gem install bundler
```

## Install project dependencies

From the repository root:

```bash
bundle install
```

If you want dependencies stored inside the project folder:

```bash
bundle install --path vendor/bundle
```

## Preview locally

```bash
bundle exec jekyll serve
```

Open:

```text
http://127.0.0.1:4000/
```

When the server is running, edits to `_data/home.yml`, `index.html`, and
`assets/site.css` should rebuild automatically. Refresh the browser to see the
latest page.

## Build once

```bash
bundle exec jekyll build
```

The generated HTML appears in `_site/`. Do not edit or commit `_site/`; GitHub
Pages builds the site from the source files.

## Push to GitHub Pages

Commit and push the source files:

```bash
git add .
git commit -m "Update homepage"
git push
```

GitHub Pages will run Jekyll automatically for the
`billzhao1030.github.io` repository.

## Common issues

If `jekyll` is not found:

```bash
bundle exec jekyll -v
```

Use `bundle exec` so the project-local gem versions are used.

If native gems fail to build on Linux, install build tools:

```bash
sudo apt install build-essential ruby-dev zlib1g-dev
```

If Ruby 2.6 causes dependency issues on a new machine, install Ruby 3.x and run:

```bash
bundle update
bundle install
```
