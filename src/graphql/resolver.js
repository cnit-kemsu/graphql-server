import graphqlHTTP from 'express-graphql';
import { customFormatErrorFn } from './formatError';

function sendError(originalError, responce) {
  customFormatErrorFn({ originalError })
  |> responce.json({
    errors: [#]
  });
}

// function toContextFiles({ mimetype, buffer, fieldname }) {
//   const [key, ...pathArray] = fieldname.split('.');
//   return {
//     mimetype,
//     buffer,
//     key,
//     pathArray
//   };
// }

// function createFileProperty(tragetObject, { fieldname, mimetype, buffer }) {
  
//   const pathArray = fieldname.split('.');
//   let tragetProp = tragetObject,
//     nextPropName = pathArray[0], currentPropName;
//   for (let index = 0; index < pathArray.length - 1; index++) {
//     currentPropName = nextPropName;
//     nextPropName = pathArray[index + 1];
//     if (tragetProp[currentPropName] == null) {
//       if (isNaN(nextPropName)) tragetProp[currentPropName] = {};
//       else tragetProp[currentPropName] = [];
//     }
//     tragetProp = tragetProp[currentPropName];
//   }
//   tragetProp[nextPropName] = {
//     mimetype,
//     buffer
//   };
// }

// function createFilesObject(files) {
//   const filesObject = {};
//   if (files != null) for (const file of files) createFileProperty(filesObject, file);
//   return filesObject;
// }

function assignFiles(value, files) {
    if (typeof value === 'string' && value.substring(0, 11) === 'blob_index=') {
      const { mimetype, buffer } = files[value.substring(11)];
      return { mimetype, buffer };
    };
    if (value instanceof Object) for (const key in value) value[key] = assignFiles(value[key], files);
    return value;
}

export function graphqlResolver(schema, loaders, options) {

  const _options = async function(request, responce) {

    try {

      const [context, extensions] = await options(request);
      for (const [name, loader] of Object.entries(loaders)) {
        context[name] = loader.bind(context);
      }

      //context.files = request.files.map(toContextFiles);
      //context.files = createFilesObject(request.files);

      return {
        schema,
        context,
        extensions,
        customFormatErrorFn
      };

    } catch (error) {
      sendError(error, responce);
    }
    
  };
  const graphqlMiddleware = graphqlHTTP(_options);

  return async function (request, responce) {

    try {
      let variables = JSON.parse(request.body.variables);
      variables = assignFiles(variables, request.files);
      request.body.variables = variables;
      await graphqlMiddleware(request, responce);
    } catch(error) {
      sendError(error, responce);
    }
  };

}

// export function graphqlResolver(schema, loaders, options) {

//   const _this = {};
//   const _options = async function(request, responce) {

//     try {

//       const [context, extensions] = await options(request);
//       for (const [name, loader] of Object.entries(loaders)) {
//         context[name] = loader.bind(context);
//       }

//       context.files = request.files.map(toContextFiles);

//       return {
//         schema,
//         context,
//         extensions,
//         customFormatErrorFn
//       };

//     } catch (error) {

//       sendError(error, responce);
//       _this.responce.setHeader = () => undefined;
//       //_this.responce.json = undefined;
//       _this.responce.end = () => undefined;
//       _this.end();
//       //_this.next();
//     }
    
//   };
//   const graphqlMiddleware = graphqlHTTP(_options);

//   return async function (request, responce, next) {

//     _this.next = next;
//     _this.responce = responce;
//     _this.setHeader = responce.setHeader;
//     //_this.json = responce.json;
//     _this.end = responce.end;

//     try {
//       await graphqlMiddleware(request, _this.responce);
//     } catch(error) {
//       sendError(error, responce);
//     } finally {
//       _this.responce.setHeader = _this.setHeader;
//       //_this.responce.json = _this.json;
//       _this.responce.end = _this.end;
//     }
//   };

// }