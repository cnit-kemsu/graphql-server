import graphqlFields from 'grapqhl-fields';

export function upgradeResolveFn(target) {
  const resolveFn = target.resolve;
  if (resolveFn.constructor.name === 'AsyncFunction') {
    target.resolve = async function (obj, args, context, info) {
      const res = await resolveFn(obj, args, context, graphqlFields(info));
      return res;
    };
  } else {
    target.resolve = function (obj, args, context, info) {
      return resolveFn(obj, args, context, graphqlFields(info));
    };
  }
}