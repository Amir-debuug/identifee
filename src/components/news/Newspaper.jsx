import { Row, Col, Image } from 'react-bootstrap';
import Pagination from '../Pagination';
import NoDataFound from '../commons/NoDataFound';
import { GetFriendlyDate } from './utils';
import PublisherIcon from './PublisherIcon';
import ReadLaterButton from './ReadLaterButton';

const Title = ({ str }) => {
  return <div className="text-gray-search">{str}</div>;
};

const Newspaper = ({
  articles,
  pagination,
  onPageChange,
  search,
  onBookmark,
}) => {
  const isEmpty = articles.length === 0;

  // some images are removed after 14+ days
  // this defaults to our placeholder image if 404
  const onImageError = ({ currentTarget }) => {
    currentTarget.onerror = null; // prevents looping
    currentTarget.src = '/img/placeholders/news-placeholder-sm.png';
  };

  return (
    <>
      {isEmpty ? (
        <NoDataFound
          icon="manage_search"
          description="Try searching with a different keyword(s)."
          containerStyle="text-gray-search my-6 py-6"
          title={
            <Title
              str={
                search !== ''
                  ? `No results found: "${search}".`
                  : 'No results found.'
              }
            />
          }
        />
      ) : (
        ''
      )}
      {articles.map((article, index) => {
        return (
          <Row key={index}>
            <Col xs={12} className="border-bottom">
              <Row>
                <Col xs={9}>
                  <div className="px-3 py-3 mt-4">
                    <a href={article.url} target="_blank" rel="noreferrer">
                      <h5 className="cursor-pointer font-weight-bold">
                        {article.title}
                      </h5>
                    </a>
                    <p className="cursor-pointer text-muted">
                      {article.blurb + ` `}
                    </p>
                    <ul
                      className="d-flex m-0 p-0"
                      style={{ alignItems: 'center', listStyle: 'none' }}
                    >
                      <li className="mr-1">
                        <PublisherIcon article={article} />
                      </li>
                      <li>
                        <span className="text-muted">
                          {'·  ' + GetFriendlyDate(article.published)}
                        </span>
                      </li>
                      <li>
                        <ReadLaterButton
                          article={article}
                          onBookmark={onBookmark}
                          idx={index}
                        />
                      </li>
                    </ul>
                  </div>
                </Col>
                <Col xs={3}>
                  <div className="px-4 py-4">
                    <a href={article.url} target="_blank" rel="noreferrer">
                      {article.image ? (
                        <img
                          className="cursor-pointer img-fluid rounded"
                          src={`${article.image}&w=250`}
                          style={{ 'max-height': '150px' }}
                          onError={onImageError}
                        />
                      ) : (
                        <Image
                          className="cursor-pointer"
                          style={{ 'max-height': '150px' }}
                          fluid="true"
                          rounded="true"
                          src="/img/placeholders/news-placeholder-sm.png"
                        />
                      )}
                    </a>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        );
      })}
      {pagination.totalPages !== 1 ? (
        <Row>
          <Col className="mb-2 mb-sm-0 col-sm" />
          <Col className="col-sm-auto col">
            <div className="mt-3">
              <Pagination
                paginationInfo={pagination}
                onPageChange={onPageChange}
              />
            </div>
          </Col>
        </Row>
      ) : (
        ''
      )}
    </>
  );
};

export default Newspaper;
