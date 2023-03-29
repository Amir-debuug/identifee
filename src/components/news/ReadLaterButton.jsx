import { useState } from 'react';
import {
  OverlayTrigger,
  Tooltip,
  Button,
  Spinner,
  Image,
} from 'react-bootstrap';
import newsService from '../../services/news.service';

const labels = {
  remove: 'Remove Bookmark',
  add: 'Read Later',
};

const BookmarkIcon = ({ bookmarked }) => {
  return (
    <>
      {bookmarked ? (
        <span className="material-icons-outlined fs-18 inline text-black">
          bookmark
        </span>
      ) : (
        <div className="inline" style={{ width: '20px' }}>
          <Image src="/img/bookmark-icon.svg" fluid="true" />
        </div>
      )}
    </>
  );
};

export const ReadLaterButton = ({ article, onBookmark, idx }) => {
  const [bookmarked, setBookmarked] = useState(!!article.id);
  const [loading, setLoading] = useState(false);

  const onBookmarkClick = async (article) => {
    let resp;
    // we are assuming bookmark articles contains an id
    // and use this to delete or add bookmarks
    if (article.id) {
      setLoading(true);
      resp = await newsService.delArticle(article.id);
      article.id = null;
      setBookmarked(false);
      setLoading(false);
      onBookmark(article, idx);
    } else {
      setLoading(true);
      resp = await newsService.addArticle(article);
      if (resp.status === 200) {
        article.id = resp.data.id;
        setBookmarked(true);
      }

      setLoading(false);
    }

    return resp ? resp.data : null;
  };

  return (
    <div className="inline">
      <OverlayTrigger
        key={`left`}
        placement={`top`}
        overlay={
          <Tooltip id={`tooltip-${`left`}`}>
            {!article.id ? labels.add : labels.remove}
          </Tooltip>
        }
      >
        <Button
          variant="link"
          size="sm"
          className="px-1 py-1 text-black"
          disabled={loading}
          onClick={() => onBookmarkClick(article)}
        >
          <BookmarkIcon bookmarked={bookmarked} />
        </Button>
      </OverlayTrigger>
      {loading ? <Spinner animation="border" size="sm" /> : ''}
    </div>
  );
};

export default ReadLaterButton;
