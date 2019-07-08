import React from 'react';
import renderer from 'react-test-renderer';
import FAB from '../FAB/FAB';

describe('FABGroup', () => {
  it('renders properly', () => {
    const tree = renderer
      .create(
        <FAB.Group open={false} icon="add" visible={false}>
          <FAB small icon="add" />
          <FAB small icon="star" label="Star" />
          <FAB small icon="email" label="Email" />
          <FAB small icon="notifications" label="Remind" />
        </FAB.Group>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
