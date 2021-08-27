import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/layout';
import { IconButton, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'not-loading'
  >('not-loading');

  const [_, vote] = useVoteMutation();

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        colorScheme="green"
        aria-label="arrow-up"
        size="lg"
        icon={<ChevronUpIcon />}
        onClick={async () => {
          setLoadingState('updoot-loading');
          await vote({ postId: post.id, value: 1 });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'updoot-loading'}
      />
      <Text mt={2} mb={2}>
        {post.points}
      </Text>
      <IconButton
        colorScheme="red"
        aria-label="arrow-up"
        size="lg"
        icon={<ChevronDownIcon />}
        onClick={async () => {
          setLoadingState('downdoot-loading');
          await vote({ postId: post.id, value: -1 });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'downdoot-loading'}
      />
    </Flex>
  );
};

export default UpdootSection;
