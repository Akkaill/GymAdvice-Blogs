import { Card, CardBody, Skeleton, SkeletonText, Box } from "@chakra-ui/react";

export function BlogCardSkeleton() {
  return (
    <Card>
      <Skeleton height="180px" />
      <CardBody>
        <Skeleton height="20px" mb={2} />
        <SkeletonText mt="4" noOfLines={3} spacing="3" />
      </CardBody>
    </Card>
  );
}
