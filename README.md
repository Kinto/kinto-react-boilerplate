# Kinto React Boilerplate

A sample [Kinto](https://github.com/mozilla-services/kinto.js) & [React](http://facebook.github.io/react/) project boilerplate.

[![Build Status](https://travis-ci.org/Kinto/kinto-react-boilerplate.svg)](https://travis-ci.org/Kinto/kinto-react-boilerplate)


## Scope

The boilerplate helps you to develop Kinto JavaScript applications faster by making some decisions on your behalf. It includes:

* [React + ES6](https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html) classes using [Babel](https://babeljs.io);
* Setup **test environment** using [Mocha](http://mochajs.org/)+[Chai](http://chaijs.com/), [Sinon](http://sinonjs.org/), and [jsdom](https://github.com/tmpvar/jsdom/) for React components;
* Setup **build and packaging** using [webpack](http://webpack.github.io/);
* Basic asynchronous store for collection records <sup>[1](#note-flux)</sup>;
* Fully tested demo CRUD app with sync button.

We even provide [some recipes](https://github.com/Kinto/kinto-react-boilerplate/labels/Tutorial) to help you go further!

><a name="note-flux">1</a>: *Replacing it with a Flux library is up to you :)*

## Getting started

### Install

Start a new project and fetch the boilerplate:

    $ mkdir newproject && cd $_
    $ git init .
    $ git remote add boilerplate https://github.com/Kinto/kinto-react-boilerplate.git
    $ git fetch boilerplate
    $ git merge boilerplate/master

Install the environment and run:

    $ npm install
    $ npm start

Demo application is available at http://localhost:3000

With auto-refresh when code changes!

### Test

Run the tests suite with:

    $ npm test

> * Node v4+ is required.
> * A `travis.yml` file is provided to enable tests on TravisCI in one click!


### Publish

In order to publish the application on [Github pages](https://pages.github.com/),
you just need to run:

    $ npm run publish

After a few minutes, the application will be available at http://username.github.io/project/

If you want to check the content of the `build/` folder before publishing, or
host it somewhere else yourself, just run instead:

    $ npm run build


### Get some more

For example, let us setup [Less](http://lesscss.org/):

    $ git merge boilerplate/setup-css-less

Once merged, the dev server will be auto-refreshed when the `style.less` is modified!

Don't hesitate to **help us write more tutorials** using [simple pull-requests](https://github.com/Kinto/kinto-react-boilerplate/labels/Tutorial). :)
