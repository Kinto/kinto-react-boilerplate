var context = require.context('./test/components', true, /_test\.js$/);
context.keys().forEach(context);
