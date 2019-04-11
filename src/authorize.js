export function authorize(user) {
  if (user === undefined) throw Error('Not authorized');
}