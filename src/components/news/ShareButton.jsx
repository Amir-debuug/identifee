import { useState } from 'react';
import { OverlayTrigger, Tooltip, Button, Spinner } from 'react-bootstrap';

import feedService from '../../services/feed.service';

const ShareButton = ({ article, orgId }) => {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [shared, setShared] = useState(false);

  const isFetching = (active) => {
    setLoading(active);
    setDisabled(active);
  };

  const onShareLink = async (article) => {
    isFetching(true);
    await feedService.shareLink(
      { ...article, description: article.blurb },
      null,
      orgId,
      null
    );

    isFetching(false);
    setShared(true);
  };

  return (
    <div>
      <OverlayTrigger
        key={`left`}
        placement={`top`}
        overlay={<Tooltip id={`tooltip-${`left`}`}>Share news</Tooltip>}
      >
        <Button
          variant="link"
          size="sm"
          className="px-1 py-1 text-black"
          disabled={disabled}
        >
          <span
            className={`material-icons-outlined cursor-pointer fs-18 py-1 inline`}
            onClick={() => onShareLink(article)}
          >
            share
          </span>
        </Button>
      </OverlayTrigger>
      {loading ? <Spinner animation="border" size="sm" /> : ''}
      {shared ? <span className="text-success inline">News Shared!</span> : ''}
    </div>
  );
};

export default ShareButton;
