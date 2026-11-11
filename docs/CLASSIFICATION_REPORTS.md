# Classification reports

Readers can select **Report classification** beneath a topic chart or on a Nigerian-relevance rejection, including a rejected comparison search. They choose the suggested classification, enter a 10–2,000-character explanation, and optionally provide an HTTP(S) source link. The form confirms submission with a reference number and preserves input on failure.

`POST /api/classification-reports` saves the report as pending. Rejected subjects do not need an existing topic record. Repeated identical pending submissions return the same reference. The public response contains only the reference and pending status; there is no public report-list or moderation endpoint. SQL parameter logging is disabled so report text is not written to query logs.

Reports do not change classification until reviewed. Review is a local maintainer operation against the configured application database; no admin website or accounts are included. Run commands from `backend/`:

```sh
.venv/bin/python -m app.review_reports list
.venv/bin/python -m app.review_reports list --status approved --limit 50
.venv/bin/python -m app.review_reports review 123 approve --note 'Verified the supplied source establishes a Nigerian connection.'
.venv/bin/python -m app.review_reports review 124 dismiss --note 'The supplied source does not support the requested correction.'
```

Replace the example IDs with actual queue references. `approve` applies the report's suggested relevance; `dismiss` leaves classification unchanged. Every review records a note, timestamp and outcome. An already reviewed report cannot be reviewed again. A later report can establish a new decision; approving it updates the existing override and retains earlier report history.

Approved decisions take precedence over automatic relevance checks, including for already cached subjects. Exclusions are respected by topic retrieval, the featured collection, related suggestions, trending and the attention archive. Reviewed inclusions also bypass relevance keyword filtering in related suggestions. Search still searches Wikipedia, so an excluded subject may appear as a search suggestion; opening it shows the reviewed rejection and allows another report. Existing client caches can retain old content until refreshed.

Matching normalizes case, spaces/underscores, and Unicode composition. Wikipedia redirects and unrelated article aliases are not resolved into one moderation identity; review the submitted article name. Overrides establish relevance, not the factual accuracy of descriptions. The separate Wikipedia accuracy notice still applies.

Startup creates the two new tables (`classificationreport`, `relevanceoverride`) without changing existing topic tables. Restart the backend after updating. Tests cover both report directions, validation, pending deduplication, dismissal, replacing decisions, persistence across file-backed SQLite sessions, public receipt privacy, cached-topic exclusion, collection/ranking/archive filtering and related suggestions. Browser form interaction remains unverified in this session.
