import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const SignupSkeleton = () => (
  <div style={{ marginBottom: '1rem' }}>
    <Skeleton height={180} />
    <Skeleton height={20} width="60%" />
    <Skeleton height={16} width="40%" />
  </div>
);
export const LoginSkeleton = () => (
  <div style={{ marginBottom: '1rem' }}>
    <Skeleton height={100} />
    <Skeleton height={20} width="60%" />
    <Skeleton height={16} width="40%" />
  </div>
);
