import { Avatar, Box, Card, CardContent, Divider, Stack, SvgIcon, Typography } from '@mui/material';

const CompanyCard = (props) => {
  const { company } = props;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pb: 3
          }}
        >
         {/*  <Avatar
            src={company.logo}
            variant="square"
          /> */}
        </Box>
        <Typography
          align="center"
          gutterBottom
          variant="h5"
        >
          Title
        </Typography>
        <Typography
          align="center"
          variant="body1"
        >
          Description
        </Typography>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ p: 2 }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <SvgIcon
            color="action"
            fontSize="small"
          >
          </SvgIcon>
          <Typography
            color="text.secondary"
            display="inline"
            variant="body2"
          >
            Updated 2hr ago
          </Typography>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <SvgIcon
            color="action"
            fontSize="small"
          >
          </SvgIcon>
          <Typography
            color="text.secondary"
            display="inline"
            variant="body2"
          >
             Downloads
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export default CompanyCard

