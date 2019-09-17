import graphqlFields from 'graphql-fields';

const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;

export function upgradeResolveFn(target) {
  const resolveFn = target.resolve;
  if (resolveFn.constructor === AsyncFunction) {
    target.resolve = async function (obj, args, context, info) {
      return await resolveFn(obj, args, context, graphqlFields(info));
    };
  } else {
    target.resolve = function (obj, args, context, info) {
      return resolveFn(obj, args, context, graphqlFields(info));
    };
  }
  return target;
}