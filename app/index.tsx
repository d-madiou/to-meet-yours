import { Href, Redirect } from 'expo-router';

export default function Index() {
  // The `as Href` assertion helps ensure type safety with Expo's typed routes.
  // It tells TypeScript that "/splash" is a valid and known route.
  return <Redirect href={'/splash' as Href} />;
}