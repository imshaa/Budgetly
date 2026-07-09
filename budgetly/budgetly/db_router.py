# from django.db import connections
# from django.db.utils import DatabaseError


# class DatabaseFallbackRouter:
#     """Route read/write operations to PostgreSQL if available, otherwise fall back to SQLite."""

#     primary_alias = "default"
#     fallback_alias = "sqlite_backup"

#     def _use_primary(self):
#         try:
#             conn = connections[self.primary_alias]
#             conn.ensure_connection()
#             return True
#         except DatabaseError:
#             return False

#     def _target_db(self):
#         return self.primary_alias if self._use_primary() else self.fallback_alias

#     def db_for_read(self, model, **hints):
#         return self._target_db()

#     def db_for_write(self, model, **hints):
#         return self._target_db()

#     def allow_relation(self, obj1, obj2, **hints):
#         return True

#     def allow_migrate(self, db, app_label, model_name=None, **hints):
#         return db in {self.primary_alias, self.fallback_alias}
