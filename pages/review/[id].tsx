import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useKey } from 'react-use';

import { BackToLink, CenteredLoadingSpinner, Rating, ReviewRating, StreamingApp } from '~/components';
import { useDeleteReview, useReviewById, useUpdateReview } from '~/hooks';
import { ActionIcons, HeaderImage, reactionsMap, RoundedBox } from '~/pages-components/review';
import { Box, Button, Checkbox, FlexLayout, Icon, Text, Textarea, TextInput, useModal, useScreenType } from '~/ui';
import { formatDate, getUrlDomain, splitStringToNewLine, validator } from '~/utils';

export default function ReviewPage() {
  const { push, query } = useRouter();
  const reviewId = query.id as string;

  const { isMobile } = useScreenType();
  const { data: review, isLoading } = useReviewById(reviewId);
  const { mutateAsync: updateReview, isLoading: isUpdating } = useUpdateReview();
  const { mutateAsync: deleteReview } = useDeleteReview();
  const [deleteModal, showDeleteModal] = useModal({
    title: 'Delete review',
    content: 'Are you sure you want to delete this review?',
    actionButton: {
      text: 'Delete review',
      action: async () => deleteReview(reviewId),
    },
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [updatedReview, setUpdatedReview] = useState(review?.review);
  const [updatedUrl, setUpdatedUrl] = useState(review?.url);
  const [updatedWatchAgain, setUpdatedWatchAgain] = useState(review?.watchAgain);
  const [updatedRating, setUpdatedRating] = useState(review?.rating);

  useEffect(() => {
    if (!reviewId) {
      return;
    }

    if (!isLoading && !review) {
      push('/dashboard');
    }
  }, [reviewId, review, isLoading]);

  useEffect(() => {
    setInitialUpdatedValues();
  }, [review]);

  useKey('Escape', () => {
    setIsEditMode(false);
  });

  const setInitialUpdatedValues = () => {
    if (review) {
      setUpdatedReview(review.review);
      setUpdatedUrl(review.url);
      setUpdatedWatchAgain(review.watchAgain);
      setUpdatedRating(review.rating);
    }
  };

  if (isLoading || !review) {
    return <CenteredLoadingSpinner />;
  }

  const { image, name, updatedAt, watchAgain, rating, url } = review;
  const reviewUrlDomain = url && getUrlDomain(url);

  const isUpdateReviewDisabled = !!(
    (review.review === updatedReview || typeof validator.isEmpty("Field can't be empty")(updatedReview) === 'string') &&
    (review.url === updatedUrl || typeof validator.isURL()(updatedUrl) === 'string') &&
    review.watchAgain === updatedWatchAgain &&
    review.rating === updatedRating
  );

  return (
    <FlexLayout flexDirection="column" space={2}>
      <BackToLink text="Back to All Reviews" to="/dashboard" />
      <FlexLayout flexDirection="column" p={4} pb={8} space={[6, 8, 9]}>
        <Box sx={{ position: 'relative' }}>
          <HeaderImage img={image?.img} name={name} />
          <ActionIcons isEditMode={isEditMode} onDelete={showDeleteModal} onEdit={() => setIsEditMode(!isEditMode)} />
          <Box sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, 45%)' }}>
            {isEditMode ? (
              <Box bg="white-alpha-25" px={3} py={2} sx={{ borderRadius: '50px', backdropFilter: 'blur(5px)' }}>
                <Rating rating={updatedRating ?? null} onChange={(value) => setUpdatedRating(value)} />
              </Box>
            ) : (
              <ReviewRating rating={rating} />
            )}
          </Box>
        </Box>
        <FlexLayout flexDirection="column" space={7}>
          <Text sx={{ alignSelf: 'center' }} variant={isMobile ? 'headline-h2' : 'headline-h1'}>
            {name}
          </Text>
          <FlexLayout flexDirection="column" space={6}>
            <FlexLayout flexDirection={['column', 'row']} space={[3, 3, 5]} sx={{ alignSelf: ['unset', 'center'] }}>
              <RoundedBox
                element={
                  isEditMode ? (
                    <TextInput
                      error={validator.isURL()(updatedUrl)}
                      value={updatedUrl ?? ''}
                      onChange={setUpdatedUrl}
                    />
                  ) : (
                    <StreamingApp link={url} name={reviewUrlDomain} showName />
                  )
                }
                info={reviewUrlDomain || isEditMode ? '' : 'Link not provided.'}
                title="Watch it here"
              />
              <RoundedBox
                element={
                  isEditMode ? (
                    <Checkbox value={!!updatedWatchAgain} onChange={(value) => setUpdatedWatchAgain(!!value)} />
                  ) : (
                    watchAgain && (
                      <FlexLayout bg="dark" p={[2, 3]} sx={{ borderRadius: '50%' }}>
                        <Icon color="white" icon="check" size="l" />
                      </FlexLayout>
                    )
                  )
                }
                info={watchAgain && updatedWatchAgain ? 'Yes, for sure!' : "I'm not sure."}
                title="Watch again or recommend?"
              />
              <RoundedBox
                element={<Icon icon={reactionsMap[rating ?? 0].icon} size="xxl" />}
                info={reactionsMap[rating ?? 0].text}
                title="Your reaction"
              />
            </FlexLayout>
            <FlexLayout flexDirection="column" space={5}>
              <Text variant="headline-h4">Your review</Text>
              {isEditMode ? (
                <Textarea
                  error={validator.isEmpty("Field can't be empty")(updatedReview)}
                  value={updatedReview}
                  onChange={setUpdatedReview}
                />
              ) : (
                <FlexLayout flexDirection="column" space={5}>
                  <Text>{splitStringToNewLine(review.review)}</Text>
                  <Text color="dimmed" variant="paragraph-small">
                    <i>Last updated on {formatDate(updatedAt)}</i>
                  </Text>
                </FlexLayout>
              )}
            </FlexLayout>
          </FlexLayout>
          {isEditMode && (
            <FlexLayout flexDirection={['column', 'row']} space={[4, 5]}>
              <Button
                isDisabled={isUpdating || isUpdateReviewDisabled}
                isFullWidth={isMobile}
                isLoading={isUpdating}
                text="Save changes"
                onClick={async () => {
                  await updateReview({
                    id: reviewId,
                    data: {
                      review: updatedReview as string,
                      rating: updatedRating,
                      url: updatedUrl,
                      watchAgain: !!updatedWatchAgain,
                    },
                  });
                  setIsEditMode(false);
                }}
              />
              <Button
                isFullWidth={isMobile}
                text="Cancel"
                variant="secondary"
                onClick={() => {
                  setIsEditMode(false);
                  setInitialUpdatedValues();
                }}
              />
            </FlexLayout>
          )}
        </FlexLayout>
        {deleteModal}
      </FlexLayout>
    </FlexLayout>
  );
}
