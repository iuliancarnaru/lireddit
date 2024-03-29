import {
  Heading,
  Link,
  Stack,
  Box,
  Text,
  Flex,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import React from 'react';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import UpdootSection from '../components/UpdootSection';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 5,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  if (!fetching && !data) {
    return <div>your query failed for some reason</div>;
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>

      <br />
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={4}>
          {data!.posts.posts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={post} />
              <Box>
                <Heading fontSize="xl">{post.title}</Heading>
                <Text>posted by {post.creator.username}</Text>
                <Text mt={4}>{post.textSnippet}...</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}

      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            m="auto"
            my={8}
            isLoading={fetching}
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
