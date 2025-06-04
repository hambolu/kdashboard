import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
};

const PageContainer = ({ title, description, children }: Props) => {
  return (
    <Box>
      {(title || description) && (
        <Box mb={4}>
          {title && (
            <Typography variant="h4" color="textPrimary">
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="subtitle2" color="textSecondary">
              {description}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

export default PageContainer;
