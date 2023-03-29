import GenericTable from '../../components/GenericTable';
import { decimalToNumber } from '../../utils/Utils';

const CourseProgressReport = (results) => {
  const { data } = results[0];

  const rows = data.map((result, index) => {
    const rank = index + 1;

    return {
      id: index,
      dataRow: [
        {
          key: 'rank',
          component: (
            <div className="rank-container">
              <span className={`rank-${rank}`}>{rank}</span>
            </div>
          ),
        },
        {
          key: 'name',
          component: result['User.fullName'],
        },
        {
          key: 'attempts',
          component: result['CourseProgress.count'],
        },
        {
          key: 'score',
          component: decimalToNumber(
            result['CourseProgress.averageOfScore'],
            0
          ),
        },
        {
          key: 'points',
          component: decimalToNumber(result['CourseProgress.maxPoints'], 0),
        },
      ],
    };
  });

  return (
    <div style={{ maxWidth: '1220px' }}>
      <div>
        <GenericTable
          checkbox={false}
          data={rows}
          columns={[
            {
              key: 'rank',
              component: 'Rank',
              width: '5%',
            },
            {
              key: 'name',
              component: 'User',
            },
            {
              key: 'attempts',
              component: 'Attempts',
              width: '30%',
            },
            {
              key: 'score',
              component: 'Score',
            },
            {
              key: 'points',
              component: 'Points',
            },
          ]}
          usePagination={false}
          noDataInDbValidation={true}
        />
      </div>
    </div>
  );
};

export default CourseProgressReport;
